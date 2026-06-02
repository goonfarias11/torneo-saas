'use client'

import { addTeamToTournament, createTeamAndAddToTournament, removeTeamFromTournament } from "@/actions/tournament"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [isCreating, startCreateTransition] = useTransition()
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [shortName, setShortName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const isCreateMode = selectedTeamId === 'CREATE_TEAM'

  function handleAdd() {
    if (!selectedTeamId) return
    setError('')
    startTransition(async () => {
      try {
        await addTeamToTournament(tournamentId, selectedTeamId)
        setSelectedTeamId('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo agregar el equipo')
      }
    })
  }

  function handleCreate() {
    if (teamName.trim().length < 2) return
    setError('')
    const formData = new FormData()
    formData.set('name', teamName)
    formData.set('shortName', shortName)
    formData.set('description', description)

    startCreateTransition(async () => {
      try {
        await createTeamAndAddToTournament(tournamentId, formData)
        setTeamName('')
        setShortName('')
        setDescription('')
        setSelectedTeamId('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo crear el equipo')
      }
    })
  }

  const busy = isPending || isCreating

  return (
    <div className="space-y-2 pt-2 border-t mt-2">
      <p className="text-xs text-muted-foreground font-medium">Agregar equipo</p>

      <select
        value={selectedTeamId}
        onChange={(e) => {
          setSelectedTeamId(e.target.value)
          setError('')
        }}
        className="w-full p-2 border rounded text-sm bg-background"
        disabled={busy}
      >
        <option value="">Seleccionar...</option>
        {availableTeams.map((team) => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
        <option value="CREATE_TEAM">+ Crear nuevo equipo</option>
      </select>

      {!isCreateMode && availableTeams.length === 0 && (
        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          No hay equipos disponibles. Usa la opcion de crear nuevo equipo.
        </p>
      )}

      {!isCreateMode && (
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!selectedTeamId || busy}
          size="sm"
          className="w-full"
        >
          {isPending ? 'Agregando...' : '+ Agregar'}
        </Button>
      )}

      {isCreateMode && (
        <div className="space-y-3 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label htmlFor="inline-team-name" className="text-xs">Nombre</Label>
            <Input
              id="inline-team-name"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Ej: Los Leones"
              disabled={busy}
              minLength={2}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="inline-team-short-name" className="text-xs">Nombre corto</Label>
            <Input
              id="inline-team-short-name"
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
              placeholder="Ej: LEO"
              disabled={busy}
              maxLength={5}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="inline-team-description" className="text-xs">Descripcion</Label>
            <Input
              id="inline-team-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Opcional"
              disabled={busy}
            />
          </div>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={teamName.trim().length < 2 || busy}
            size="sm"
            className="w-full"
          >
            {isCreating ? 'Creando...' : 'Crear y agregar'}
          </Button>
        </div>
      )}

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}
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
