'use server'

import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getSportParticipantConfig } from '@/features/sports/participant-config'
import { revalidatePath } from 'next/cache'

export async function createTeamMember(tournamentId: string, teamId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { organization: true },
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

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      organizationId: tournament.organizationId,
    },
  })
  if (!team) throw new Error('Equipo no encontrado')

  const config = getSportParticipantConfig(tournament.sportSlug)
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const memberType = String(formData.get('memberType') ?? 'PLAYER')
  const roleSlug = String(formData.get('roleSlug') ?? '').trim()
  const positionSlug = String(formData.get('positionSlug') ?? '').trim()
  const jerseyNumber = String(formData.get('jerseyNumber') ?? '').trim()

  if (firstName.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres')

  const allowedRoles = [...config.positions, ...config.staffRoles]
  const selectedRole = allowedRoles.find((role) => role.slug === (memberType === 'PLAYER' ? positionSlug : roleSlug))
  if (!selectedRole) throw new Error('Selecciona un rol válido para este deporte')

  try {
    const person = await prisma.person.create({
      data: {
        organizationId: tournament.organizationId,
        firstName,
        lastName: lastName || null,
        displayName: [firstName, lastName].filter(Boolean).join(' '),
      },
    })

    await prisma.teamMember.create({
      data: {
        organizationId: tournament.organizationId,
        teamId,
        personId: person.id,
        sportSlug: tournament.sportSlug,
        memberType,
        positionSlug: memberType === 'PLAYER' ? positionSlug : null,
        roleSlug: memberType === 'PLAYER' ? null : roleSlug,
        jerseyNumber: jerseyNumber || null,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ese integrante ya existe en el plantel')
    }
    throw error
  }

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}

export async function removeTeamMember(tournamentId: string, teamMemberId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) throw new Error('Torneo no encontrado')

  const member = await prisma.teamMember.findFirst({
    where: {
      id: teamMemberId,
      organizationId: tournament.organizationId,
    },
  })
  if (!member) throw new Error('Integrante no encontrado')

  await prisma.teamMember.delete({ where: { id: teamMemberId } })
  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}
