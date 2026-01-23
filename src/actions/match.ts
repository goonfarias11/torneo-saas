'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { MatchStatus } from '@prisma/client'

/**
 * Genera fixtures para un torneo tipo LEAGUE (round-robin)
 * Algoritmo: todos contra todos
 */
export async function generateFixtures(tournamentId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        include: {
          team: true,
        },
      },
    },
  })

  if (!tournament) {
    throw new Error('Torneo no encontrado')
  }

  if (tournament.type !== 'LEAGUE') {
    throw new Error('Solo se pueden generar fixtures para torneos tipo Liga')
  }

  const teams = tournament.participants.map((p) => p.team)

  if (teams.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos para generar fixtures')
  }

  // Eliminar fixtures previos
  await prisma.match.deleteMany({
    where: { tournamentId },
  })
  await prisma.round.deleteMany({
    where: { tournamentId },
  })

  // Generar partidos round-robin
  const matches: Array<{ homeTeamId: string; awayTeamId: string; roundNumber: number }> = []
  let roundNumber = 1

  // Todos contra todos (ida)
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        homeTeamId: teams[i].id,
        awayTeamId: teams[j].id,
        roundNumber,
      })
      roundNumber++
    }
  }

  // Crear rondas y partidos
  const roundsMap = new Map<number, string>()

  for (const match of matches) {
    let roundId = roundsMap.get(match.roundNumber)

    if (!roundId) {
      const round = await prisma.round.create({
        data: {
          tournamentId,
          number: match.roundNumber,
          name: `Fecha ${match.roundNumber}`,
        },
      })
      roundId = round.id
      roundsMap.set(match.roundNumber, round.id)
    }

    await prisma.match.create({
      data: {
        tournamentId,
        roundId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        status: MatchStatus.SCHEDULED,
      },
    })
  }

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true, matchesGenerated: matches.length }
}

export async function updateMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  })

  if (!match) {
    throw new Error('Partido no encontrado')
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      status: MatchStatus.FINISHED,
      playedAt: new Date(),
    },
  })

  revalidatePath(`/tournament/${match.tournamentId}`)
  return { success: true }
}

export async function getMatchesByTournament(tournamentId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      round: true,
    },
    orderBy: [
      {
        round: {
          number: 'asc',
        },
      },
    ],
  })

  return matches
}
