'use client'

import { addTeamToTournament } from "@/actions/tournament"
import { Button } from "@/components/ui/button"
import { useState, useTransition } from "react"

interface Team {
  id: string
  name: string
}

export function TeamSelector({ 
  tournamentId, 
  availableTeams 
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

  if (availableTeams.length === 0) {
    return null
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      <select
        value={selectedTeamId}
        onChange={(e) => setSelectedTeamId(e.target.value)}
        className="w-full p-2 border rounded text-sm"
        disabled={isPending}
      >
        <option value="">Seleccionar equipo...</option>
        {availableTeams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <Button 
        onClick={handleAdd} 
        disabled={!selectedTeamId || isPending}
        size="sm"
        className="w-full"
      >
        {isPending ? 'Agregando...' : 'Agregar Equipo'}
      </Button>
    </div>
  )
}
