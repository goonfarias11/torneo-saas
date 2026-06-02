import prisma from '@/lib/prisma'

interface IncrementStatisticInput {
  organizationId: string
  tournamentId: string
  matchId: string
  sportSlug: string
  statSlug: string
  value: number
  personId?: string | null
  teamId?: string | null
}

async function incrementPlayerStatistic(input: IncrementStatisticInput, scope: 'MATCH' | 'TOURNAMENT') {
  if (!input.personId) return

  const existing = await prisma.playerStatistic.findFirst({
    where: {
      personId: input.personId,
      teamId: input.teamId ?? null,
      tournamentId: input.tournamentId,
      matchId: scope === 'MATCH' ? input.matchId : null,
      sportSlug: input.sportSlug,
      statSlug: input.statSlug,
      scope,
    },
  })

  if (existing) {
    await prisma.playerStatistic.update({
      where: { id: existing.id },
      data: { value: { increment: input.value } },
    })
    return
  }

  await prisma.playerStatistic.create({
    data: {
      personId: input.personId,
      teamId: input.teamId ?? null,
      tournamentId: input.tournamentId,
      matchId: scope === 'MATCH' ? input.matchId : null,
      sportSlug: input.sportSlug,
      statSlug: input.statSlug,
      scope,
      value: input.value,
    },
  })
}

async function incrementTournamentStatistic(input: IncrementStatisticInput) {
  const existing = await prisma.tournamentStatistic.findFirst({
    where: {
      tournamentId: input.tournamentId,
      teamId: input.teamId ?? null,
      personId: input.personId ?? null,
      sportSlug: input.sportSlug,
      statSlug: input.statSlug,
    },
  })

  if (existing) {
    await prisma.tournamentStatistic.update({
      where: { id: existing.id },
      data: { value: { increment: input.value } },
    })
    return
  }

  await prisma.tournamentStatistic.create({
    data: {
      tournamentId: input.tournamentId,
      teamId: input.teamId ?? null,
      personId: input.personId ?? null,
      sportSlug: input.sportSlug,
      statSlug: input.statSlug,
      value: input.value,
    },
  })
}

async function incrementSeasonStatistic(input: IncrementStatisticInput) {
  const seasonSlug = new Date().getFullYear().toString()
  const existing = await prisma.seasonStatistic.findFirst({
    where: {
      organizationId: input.organizationId,
      seasonSlug,
      teamId: input.teamId ?? null,
      personId: input.personId ?? null,
      sportSlug: input.sportSlug,
      statSlug: input.statSlug,
    },
  })

  if (existing) {
    await prisma.seasonStatistic.update({
      where: { id: existing.id },
      data: { value: { increment: input.value } },
    })
    return
  }

  await prisma.seasonStatistic.create({
    data: {
      organizationId: input.organizationId,
      seasonSlug,
      teamId: input.teamId ?? null,
      personId: input.personId ?? null,
      sportSlug: input.sportSlug,
      statSlug: input.statSlug,
      value: input.value,
    },
  })
}

export async function applyMatchEventStatistics(input: IncrementStatisticInput) {
  await Promise.all([
    incrementPlayerStatistic(input, 'MATCH'),
    incrementPlayerStatistic(input, 'TOURNAMENT'),
    incrementTournamentStatistic(input),
    incrementSeasonStatistic(input),
  ])
}
