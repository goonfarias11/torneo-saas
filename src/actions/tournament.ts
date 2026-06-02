'use server'

import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createSportAdapter } from '@/features/sports/adapters'
import { getSportBySlug } from '@/features/sports/catalog'
import { parseRulesFromForm } from '@/features/sports/rules-engine'
import type { CompetitionFormatSlug } from '@/features/sports/types'
import { revalidatePath } from 'next/cache'

export async function createTournament(organizationId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const membership = await prisma.organizationUser.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId } },
  })
  if (!membership) throw new Error('No tienes acceso a esta organización')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const sportSlug = (formData.get('sportSlug') as string) || 'football'
  const formatSlug = (formData.get('formatSlug') as string) || 'league'
  const presetSlug = (formData.get('presetSlug') as string) || undefined
  const sport = getSportBySlug(sportSlug)

  if (!name || name.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres')
  if (!sport) throw new Error('Selecciona un deporte válido')

  const adapter = createSportAdapter(sportSlug)
  const configuration = adapter.composeConfiguration({
    sportSlug,
    formatSlug: formatSlug as CompetitionFormatSlug,
    presetSlug,
    rules: parseRulesFromForm(formData, sport),
  })

  const pointsForWin = Number(formData.get('pointsForWin') ?? configuration.scoringConfig.win)
  const pointsForDraw = Number(formData.get('pointsForDraw') ?? configuration.scoringConfig.draw ?? 0)
  const pointsForLoss = Number(formData.get('pointsForLoss') ?? configuration.scoringConfig.loss)
  const pointsForBye = Number(formData.get('pointsForBye') ?? configuration.scoringConfig.bye ?? 0)

  const tournament = await prisma.tournament.create({
    data: {
      organizationId,
      name: name.trim(),
      description: description?.trim() || null,
      type: formatSlug.toUpperCase().replace(/-/g, '_'),
      sportSlug,
      formatSlug,
      presetSlug,
      participantMode: configuration.sport.type[0].toUpperCase(),
      competitionMode: configuration.format.slug.toUpperCase().replace(/-/g, '_'),
      status: 'DRAFT',
      pointsForWin,
      pointsForDraw,
      pointsForLoss,
      pointsForBye,
      rulesConfig: JSON.stringify(configuration.rulesConfig),
      scoringConfig: JSON.stringify(configuration.scoringConfig),
      standingsConfig: JSON.stringify(configuration.standingsConfig),
      fixtureConfig: JSON.stringify(configuration.fixtureConfig),
      statisticsConfig: JSON.stringify(configuration.statisticsConfig),
      uiConfig: JSON.stringify(configuration.uiConfig),
    },
  })

  revalidatePath(`/org/${organizationId}`)
  return { success: true, tournamentId: tournament.id }
}

export async function updateTournament(tournamentId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw new Error('Torneo no encontrado')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const pointsForWin = parseInt(formData.get('pointsForWin') as string) || tournament.pointsForWin
  const pointsForDraw = parseInt(formData.get('pointsForDraw') as string) || tournament.pointsForDraw
  const pointsForLoss = parseInt(formData.get('pointsForLoss') as string) || tournament.pointsForLoss

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      name: name?.trim() || tournament.name,
      description: description?.trim() || null,
      pointsForWin,
      pointsForDraw,
      pointsForLoss,
    },
  })

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}

export async function deleteTournament(tournamentId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { organization: true },
  })
  if (!tournament) throw new Error('Torneo no encontrado')

  await prisma.tournament.delete({ where: { id: tournamentId } })

  revalidatePath(`/org/${tournament.organization.slug}`)
  return { success: true, organizationSlug: tournament.organization.slug }
}

export async function getTournamentsByOrganization(organizationId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.tournament.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { participants: true, matches: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getTournamentById(tournamentId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      organization: true,
      participants: {
        include: {
          team: {
            include: {
              members: {
                where: { status: 'ACTIVE' },
                include: { person: true },
                orderBy: [{ memberType: 'asc' }, { jerseyNumber: 'asc' }, { createdAt: 'asc' }],
              },
            },
          },
        },
      },
      rounds: {
        include: {
          matches: {
            include: {
              homeTeam: true,
              awayTeam: true,
              events: {
                include: {
                  person: true,
                  relatedPerson: true,
                  team: true,
                },
                orderBy: [{ minute: 'asc' }, { createdAt: 'asc' }],
              },
            },
          },
        },
        orderBy: { number: 'asc' },
      },
    },
  })

  if (!tournament) throw new Error('Torneo no encontrado')

  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: tournament.organizationId,
      },
    },
  })
  if (!membership) throw new Error('No tienes acceso a este torneo')

  return tournament
}

export async function updateTournamentStatus(tournamentId: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw new Error('Torneo no encontrado')

  await prisma.tournament.update({ where: { id: tournamentId }, data: { status } })

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}

export async function addTeamToTournament(tournamentId: string, teamId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  // Verificar que el torneo esté en DRAFT
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw new Error('Torneo no encontrado')
  if (tournament.status !== 'DRAFT') throw new Error('No se pueden agregar equipos a un torneo activo')

  await prisma.tournamentTeam.create({ data: { tournamentId, teamId } })

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}

export async function createTeamAndAddToTournament(tournamentId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { organization: true },
  })
  if (!tournament) throw new Error('Torneo no encontrado')
  if (tournament.status !== 'DRAFT') throw new Error('No se pueden agregar equipos a un torneo activo')

  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: tournament.organizationId,
      },
    },
  })
  if (!membership) throw new Error('No tienes acceso a este torneo')

  const name = String(formData.get('name') ?? '').trim()
  const shortName = String(formData.get('shortName') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (name.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres')

  let team
  try {
    team = await prisma.team.create({
      data: {
        organizationId: tournament.organizationId,
        name,
        shortName: shortName || null,
        description: description || null,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ya existe un equipo con ese nombre en la organización')
    }
    throw error
  }

  await prisma.tournamentTeam.create({
    data: {
      tournamentId,
      teamId: team.id,
    },
  })

  revalidatePath(`/tournament/${tournamentId}`)
  revalidatePath(`/org/${tournament.organization.slug}`)
  return { success: true, teamId: team.id }
}

export async function removeTeamFromTournament(tournamentId: string, teamId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw new Error('Torneo no encontrado')
  if (tournament.status !== 'DRAFT') throw new Error('No se pueden quitar equipos de un torneo activo')

  await prisma.tournamentTeam.delete({
    where: { tournamentId_teamId: { tournamentId, teamId } },
  })

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}
