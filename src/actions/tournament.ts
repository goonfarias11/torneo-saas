'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TournamentStatus, TournamentType } from '@prisma/client'

export async function createTournament(organizationId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const membership = await prisma.organizationUser.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId } },
  })
  if (!membership) throw new Error('No tienes acceso a esta organización')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const type = (formData.get('type') as TournamentType) || TournamentType.LEAGUE
  const pointsForWin = parseInt(formData.get('pointsForWin') as string) || 3
  const pointsForDraw = parseInt(formData.get('pointsForDraw') as string) || 1
  const pointsForLoss = parseInt(formData.get('pointsForLoss') as string) || 0

  if (!name || name.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres')

  const tournament = await prisma.tournament.create({
    data: {
      organizationId,
      name: name.trim(),
      description: description?.trim() || null,
      type,
      status: TournamentStatus.DRAFT,
      pointsForWin,
      pointsForDraw,
      pointsForLoss,
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
        include: { team: true },
      },
      rounds: {
        include: {
          matches: {
            include: {
              homeTeam: true,
              awayTeam: true,
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

export async function updateTournamentStatus(tournamentId: string, status: TournamentStatus) {
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
