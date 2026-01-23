'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TournamentStatus, TournamentType } from '@prisma/client'

export async function createTournament(organizationId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  // Verificar acceso a la organización
  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  })

  if (!membership) {
    throw new Error('No tienes acceso a esta organización')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const type = (formData.get('type') as TournamentType) || TournamentType.LEAGUE

  const tournament = await prisma.tournament.create({
    data: {
      organizationId,
      name,
      description,
      type,
      status: TournamentStatus.DRAFT,
    },
  })

  revalidatePath(`/org/${organizationId}`)
  return { success: true, tournamentId: tournament.id }
}

export async function getTournamentsByOrganization(organizationId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const tournaments = await prisma.tournament.findMany({
    where: {
      organizationId,
    },
    include: {
      _count: {
        select: {
          participants: true,
          matches: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return tournaments
}

export async function getTournamentById(tournamentId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      organization: true,
      participants: {
        include: {
          team: true,
        },
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
        orderBy: {
          number: 'asc',
        },
      },
    },
  })

  if (!tournament) {
    throw new Error('Torneo no encontrado')
  }

  // Verificar acceso
  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: tournament.organizationId,
      },
    },
  })

  if (!membership) {
    throw new Error('No tienes acceso a este torneo')
  }

  return tournament
}

export async function updateTournamentStatus(
  tournamentId: string,
  status: TournamentStatus
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  })

  if (!tournament) {
    throw new Error('Torneo no encontrado')
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status },
  })

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}

export async function addTeamToTournament(tournamentId: string, teamId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  await prisma.tournamentTeam.create({
    data: {
      tournamentId,
      teamId,
    },
  })

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}

export async function removeTeamFromTournament(tournamentId: string, teamId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  await prisma.tournamentTeam.delete({
    where: {
      tournamentId_teamId: {
        tournamentId,
        teamId,
      },
    },
  })

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true }
}
