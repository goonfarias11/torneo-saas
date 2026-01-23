'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface StandingRow {
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

/**
 * Calcula la tabla de posiciones de un torneo
 */
export async function calculateStandings(tournamentId: string): Promise<StandingRow[]> {
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
      matches: {
        where: {
          status: 'FINISHED',
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  })

  if (!tournament) {
    throw new Error('Torneo no encontrado')
  }

  const { pointsForWin, pointsForDraw, pointsForLoss } = tournament

  // Inicializar estadísticas
  const standings = new Map<string, StandingRow>()

  tournament.participants.forEach((participant) => {
    standings.set(participant.teamId, {
      teamId: participant.teamId,
      teamName: participant.team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })
  })

  // Calcular estadísticas
  tournament.matches.forEach((match) => {
    if (match.homeScore === null || match.awayScore === null) return

    const homeStats = standings.get(match.homeTeamId)!
    const awayStats = standings.get(match.awayTeamId)!

    homeStats.played++
    awayStats.played++

    homeStats.goalsFor += match.homeScore
    homeStats.goalsAgainst += match.awayScore
    awayStats.goalsFor += match.awayScore
    awayStats.goalsAgainst += match.homeScore

    if (match.homeScore > match.awayScore) {
      // Victoria local
      homeStats.won++
      homeStats.points += pointsForWin
      awayStats.lost++
      awayStats.points += pointsForLoss
    } else if (match.homeScore < match.awayScore) {
      // Victoria visitante
      awayStats.won++
      awayStats.points += pointsForWin
      homeStats.lost++
      homeStats.points += pointsForLoss
    } else {
      // Empate
      homeStats.drawn++
      awayStats.drawn++
      homeStats.points += pointsForDraw
      awayStats.points += pointsForDraw
    }

    homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst
    awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst
  })

  // Ordenar por: puntos, diferencia de goles, goles a favor
  const sortedStandings = Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  return sortedStandings
}
