'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Genera fixtures para un torneo tipo LEAGUE (round-robin)
 * Algoritmo de circle/round-robin correcto: agrupa partidos en fechas reales
 * Con N equipos (par), hay N-1 fechas con N/2 partidos cada una
 * Con N equipos (impar), hay N fechas con (N-1)/2 partidos cada una
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
        include: { team: true },
      },
    },
  })

  if (!tournament) throw new Error('Torneo no encontrado')
  if (!['league', 'round-robin', 'home-away'].includes(tournament.formatSlug)) {
    throw new Error('Este formato requiere un generador de fixture específico')
  }

  const teams = tournament.participants.map((p) => p.team)
  if (teams.length < 2) throw new Error('Se necesitan al menos 2 equipos para generar fixtures')

  // Eliminar fixtures previos
  await prisma.match.deleteMany({ where: { tournamentId } })
  await prisma.round.deleteMany({ where: { tournamentId } })

  // Algoritmo Circle/Round-Robin
  // Si número de equipos es impar, agregar un "bye" (equipo fantasma)
  const teamsForSchedule = [...teams]
  const hasBye = teamsForSchedule.length % 2 !== 0
  if (hasBye) teamsForSchedule.push({ id: 'BYE', name: 'BYE' } as any)

  const n = teamsForSchedule.length
  const legs = tournament.formatSlug === 'home-away' ? 2 : 1
  const numRounds = (n - 1) * legs
  const matchesPerRound = n / 2

  // Crear todas las rondas primero
  const rounds: { id: string; number: number }[] = []
  for (let r = 1; r <= numRounds; r++) {
    const round = await prisma.round.create({
      data: {
        tournamentId,
        number: r,
        name: `Fecha ${r}`,
      },
    })
    rounds.push({ id: round.id, number: r })
  }

  // Generar partidos por ronda usando el método de rotación
  const fixed = teamsForSchedule[0]
  const rotating = teamsForSchedule.slice(1)
  let totalMatches = 0

  for (let r = 0; r < numRounds; r++) {
    const round = rounds[r]
    const leg = Math.floor(r / (n - 1))
    const rotationRound = r % (n - 1)
    const roundTeams = [fixed, ...rotating]

    const matchesToCreate: { homeTeamId: string; awayTeamId: string }[] = []

    for (let m = 0; m < matchesPerRound; m++) {
      const home = roundTeams[m]
      const away = roundTeams[n - 1 - m]
      
      // Saltar partidos con BYE
      if (home.id === 'BYE' || away.id === 'BYE') continue

      // Alternar local/visitante para distribución equitativa
      const shouldSwapHome = (rotationRound + leg) % 2 !== 0
      if (!shouldSwapHome) {
        matchesToCreate.push({ homeTeamId: home.id, awayTeamId: away.id })
      } else {
        matchesToCreate.push({ homeTeamId: away.id, awayTeamId: home.id })
      }
    }

    // Crear partidos de esta ronda
    for (const m of matchesToCreate) {
      await prisma.match.create({
        data: {
          tournamentId,
          roundId: round.id,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          status: 'SCHEDULED',
        },
      })
      totalMatches++
    }

    // Rotar equipos (excepto el fijo en posición 0)
    if (rotationRound === n - 2) {
      rotating.splice(0, rotating.length, ...teamsForSchedule.slice(1))
    } else {
      rotating.unshift(rotating.pop()!)
    }
  }

  revalidatePath(`/tournament/${tournamentId}`)
  return { success: true, matchesGenerated: totalMatches }
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

  if (!match) throw new Error('Partido no encontrado')

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore,
      awayScore,
      status: 'FINISHED',
      playedAt: new Date(),
    },
  })

  revalidatePath(`/tournament/${match.tournamentId}`)
  return { success: true }
}

export async function resetMatchResult(matchId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) throw new Error('Partido no encontrado')

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: null,
      awayScore: null,
      status: 'SCHEDULED',
      playedAt: null,
    },
  })

  revalidatePath(`/tournament/${match.tournamentId}`)
  return { success: true }
}

export async function getMatchesByTournament(tournamentId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.match.findMany({
    where: { tournamentId },
    include: {
      homeTeam: true,
      awayTeam: true,
      round: true,
    },
    orderBy: [{ round: { number: 'asc' } }],
  })
}
