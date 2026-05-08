'use client'

import { addTeamToTournament, removeTeamFromTournament } from "@/actions/tournament"
import { Button } from "@/components/ui/button"
import { useState, useTransition } from "react"

interface Team {
  id: string
  name: string
}

export function TeamSelector({
  tournamentId,
  availableTeams,
}: {
  tournamentId: string
  availableTeams: Team[]
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedTeamId, setSelectedTeamId] = useState('')

  function handleAdd() {
    if (!selectedTeamId) return
    startTransition(async () => {
      await addTeamToTournament(tournamentId, selectedTeamId)
      setSelectedTeamId('')
    })
  }

  if (availableTeams.length === 0) return null

  return (
    <div className="space-y-2 pt-2 border-t mt-2">
      <p className="text-xs text-muted-foreground font-medium">Agregar equipo</p>
      <select
        value={selectedTeamId}
        onChange={(e) => setSelectedTeamId(e.target.value)}
        className="w-full p-2 border rounded text-sm bg-background"
        disabled={isPending}
      >
        <option value="">Seleccionar...</option>
        {availableTeams.map((team) => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>
      <Button
        onClick={handleAdd}
        disabled={!selectedTeamId || isPending}
        size="sm"
        className="w-full"
      >
        {isPending ? 'Agregando...' : '+ Agregar'}
      </Button>
    </div>
  )
}

export function RemoveTeamButton({
  tournamentId,
  teamId,
  teamName,
}: {
  tournamentId: string
  teamId: string
  teamName: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    if (!confirm(`¿Quitar a ${teamName} del torneo?`)) return
    startTransition(async () => {
      await removeTeamFromTournament(tournamentId, teamId)
    })
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="text-muted-foreground hover:text-destructive transition-colors ml-auto text-xs"
      title="Quitar del torneo"
    >
      {isPending ? '...' : '✕'}
    </button>
  )
}
