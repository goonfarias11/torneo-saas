'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getSportEventDefinition } from '@/features/sports/participant-config'
import { applyMatchEventStatistics } from '@/features/sports/statistics-service'
import { revalidatePath } from 'next/cache'

export async function recordMatchEvent(matchId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: {
        include: { organization: true },
      },
    },
  })
  if (!match) throw new Error('Partido no encontrado')

  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: match.tournament.organizationId,
      },
    },
  })
  if (!membership) throw new Error('No tienes acceso a este torneo')

  const eventSlug = String(formData.get('eventSlug') ?? '')
  const teamId = String(formData.get('teamId') ?? '') || null
  const personId = String(formData.get('personId') ?? '') || null
  const relatedPersonId = String(formData.get('relatedPersonId') ?? '') || null
  const opponentTeamId = String(formData.get('opponentTeamId') ?? '') || null
  const minute = Number(formData.get('minute') ?? '')
  const period = String(formData.get('period') ?? '').trim()

  const eventDefinition = getSportEventDefinition(match.tournament.sportSlug, eventSlug)
  if (!eventDefinition) throw new Error('Evento inválido para este deporte')
  if (eventDefinition.appliesTo === 'player' && !personId) throw new Error('Selecciona un jugador')
  if (eventDefinition.requiresMinute && Number.isNaN(minute)) throw new Error('Indica el minuto del evento')
  if (eventDefinition.requiresRelatedPerson && !relatedPersonId) throw new Error('Selecciona el jugador relacionado')

  const event = await prisma.matchEvent.create({
    data: {
      matchId,
      tournamentId: match.tournamentId,
      sportSlug: match.tournament.sportSlug,
      eventSlug,
      teamId,
      personId,
      relatedPersonId,
      opponentTeamId,
      minute: Number.isNaN(minute) ? null : minute,
      period: period || null,
      value: eventDefinition.value,
    },
  })

  await applyMatchEventStatistics({
    organizationId: match.tournament.organizationId,
    tournamentId: match.tournamentId,
    matchId,
    sportSlug: match.tournament.sportSlug,
    statSlug: eventDefinition.statSlug,
    value: eventDefinition.value,
    personId,
    teamId,
  })

  revalidatePath(`/tournament/${match.tournamentId}`)
  return { success: true, eventId: event.id }
}
