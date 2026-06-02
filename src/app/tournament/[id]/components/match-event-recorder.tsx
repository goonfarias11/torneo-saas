'use client'

import { useMemo, useState, useTransition } from 'react'
import { recordMatchEvent } from '@/actions/match-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSportParticipantConfig } from '@/features/sports/participant-config'

interface MatchTeam {
  id: string
  name: string
  members: Array<{
    id: string
    memberType: string
    personId: string
    person: {
      displayName: string
    }
  }>
}

interface MatchEventItem {
  id: string
  eventSlug: string
  minute: number | null
  period: string | null
  person: { displayName: string } | null
  team: { name: string } | null
}

export function MatchEventRecorder({
  matchId,
  sportSlug,
  homeTeam,
  awayTeam,
  events,
}: {
  matchId: string
  sportSlug: string
  homeTeam: MatchTeam
  awayTeam: MatchTeam
  events: MatchEventItem[]
}) {
  const [isPending, startTransition] = useTransition()
  const [teamId, setTeamId] = useState(homeTeam.id)
  const [error, setError] = useState('')
  const config = useMemo(() => getSportParticipantConfig(sportSlug), [sportSlug])
  const selectedTeam = teamId === awayTeam.id ? awayTeam : homeTeam
  const players = selectedTeam.members.filter((member) => member.memberType === 'PLAYER')

  function handleSubmit(formData: FormData) {
    setError('')
    formData.set('teamId', teamId)
    startTransition(async () => {
      try {
        await recordMatchEvent(matchId, formData)
        const form = document.getElementById(`event-form-${matchId}`) as HTMLFormElement | null
        form?.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo registrar el evento')
      }
    })
  }

  return (
    <div className="mt-3 space-y-3 rounded-md border bg-background/40 p-3">
      <p className="text-xs font-bold uppercase text-muted-foreground">Eventos y estadisticas</p>

      <form id={`event-form-${matchId}`} action={handleSubmit} className="grid gap-2 md:grid-cols-5">
        <select
          value={teamId}
          onChange={(event) => setTeamId(event.target.value)}
          className="rounded border bg-background p-2 text-xs"
          disabled={isPending}
        >
          <option value={homeTeam.id}>{homeTeam.name}</option>
          <option value={awayTeam.id}>{awayTeam.name}</option>
        </select>

        <select name="personId" className="rounded border bg-background p-2 text-xs" disabled={isPending} required>
          <option value="">Jugador...</option>
          {players.map((member) => (
            <option key={member.personId} value={member.personId}>{member.person.displayName}</option>
          ))}
        </select>

        <select name="eventSlug" className="rounded border bg-background p-2 text-xs" disabled={isPending} required>
          <option value="">Evento...</option>
          {config.matchEvents.map((event) => (
            <option key={event.slug} value={event.slug}>{event.label}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <Input name="minute" type="number" min="0" placeholder="Min" disabled={isPending} className="h-9 text-xs" />
          <Input name="period" placeholder="Periodo" disabled={isPending} className="h-9 text-xs" />
        </div>

        <Button type="submit" size="sm" disabled={isPending || players.length === 0}>
          {isPending ? 'Guardando...' : 'Registrar'}
        </Button>
      </form>

      {players.length === 0 && (
        <p className="text-xs text-muted-foreground">Carga jugadores en el plantel para registrar eventos individuales.</p>
      )}

      {events.length > 0 && (
        <div className="space-y-1">
          {events.slice(-5).map((event) => {
            const definition = config.matchEvents.find((item) => item.slug === event.eventSlug)
            return (
              <div key={event.id} className="flex flex-wrap items-center gap-2 rounded bg-muted px-2 py-1 text-xs">
                <span className="font-semibold">{definition?.label ?? event.eventSlug}</span>
                {event.minute !== null && <span>{event.minute} min</span>}
                {event.period && <span>{event.period}</span>}
                <span className="text-muted-foreground">{event.person?.displayName ?? event.team?.name ?? '-'}</span>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p className="rounded border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
