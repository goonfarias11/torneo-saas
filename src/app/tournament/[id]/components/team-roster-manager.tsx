'use client'

import { useMemo, useState, useTransition } from 'react'
import { createTeamMember, removeTeamMember } from '@/actions/roster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSportParticipantConfig } from '@/features/sports/participant-config'

interface RosterMember {
  id: string
  memberType: string
  positionSlug: string | null
  roleSlug: string | null
  jerseyNumber: string | null
  person: {
    displayName: string
  }
}

export function TeamRosterManager({
  tournamentId,
  teamId,
  teamName,
  sportSlug,
  members,
}: {
  tournamentId: string
  teamId: string
  teamName: string
  sportSlug: string
  members: RosterMember[]
}) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [memberType, setMemberType] = useState<'PLAYER' | 'COACH' | 'STAFF'>('PLAYER')
  const [error, setError] = useState('')
  const config = useMemo(() => getSportParticipantConfig(sportSlug), [sportSlug])
  const roleOptions = memberType === 'PLAYER'
    ? config.positions
    : config.staffRoles.filter((role) => role.type === memberType)

  function handleSubmit(formData: FormData) {
    setError('')
    formData.set('memberType', memberType)
    startTransition(async () => {
      try {
        await createTeamMember(tournamentId, teamId, formData)
        const form = document.getElementById(`roster-form-${teamId}`) as HTMLFormElement | null
        form?.reset()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo agregar el integrante')
      }
    })
  }

  function handleRemove(memberId: string) {
    setError('')
    startTransition(async () => {
      try {
        await removeTeamMember(tournamentId, memberId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo quitar el integrante')
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => setIsOpen((current) => !current)}
      >
        Plantel {members.filter((member) => member.memberType === 'PLAYER').length}/{config.maxRosterSize}
      </Button>

      {isOpen && (
        <div className="w-full space-y-3 rounded-md border bg-background/40 p-3 mt-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{teamName}</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cerrar
            </button>
          </div>

          {members.length > 0 && (
            <div className="space-y-1">
              {members.map((member) => {
                const role = [...config.positions, ...config.staffRoles].find((item) => item.slug === (member.positionSlug ?? member.roleSlug))
                return (
                  <div key={member.id} className="flex items-center gap-2 rounded bg-muted px-2 py-1 text-xs">
                    <span className="font-medium">{member.person.displayName}</span>
                    {member.jerseyNumber && <span className="text-muted-foreground">#{member.jerseyNumber}</span>}
                    <span className="ml-auto text-muted-foreground">{role?.label ?? member.memberType}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(member.id)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive"
                      title="Quitar integrante"
                    >
                      x
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <form id={`roster-form-${teamId}`} action={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <select
                value={memberType}
                onChange={(event) => setMemberType(event.target.value as 'PLAYER' | 'COACH' | 'STAFF')}
                className="rounded border bg-background p-2 text-xs"
                disabled={isPending}
              >
                <option value="PLAYER">Jugador</option>
                <option value="COACH">Entrenador</option>
                <option value="STAFF">Staff</option>
              </select>
              <select
                name={memberType === 'PLAYER' ? 'positionSlug' : 'roleSlug'}
                className="col-span-2 rounded border bg-background p-2 text-xs"
                disabled={isPending}
                required
              >
                <option value="">Rol...</option>
                {roleOptions.map((role) => (
                  <option key={role.slug} value={role.slug}>{role.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-[1fr_64px] gap-2">
              <div className="space-y-1">
                <Label htmlFor={`first-name-${teamId}`} className="text-xs">Nombre</Label>
                <Input id={`first-name-${teamId}`} name="firstName" placeholder="Nombre" required minLength={2} disabled={isPending} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`number-${teamId}`} className="text-xs">Nro</Label>
                <Input id={`number-${teamId}`} name="jerseyNumber" placeholder="10" disabled={isPending} />
              </div>
            </div>

            <Input name="lastName" placeholder="Apellido (opcional)" disabled={isPending} />

            <Button type="submit" size="sm" className="w-full" disabled={isPending}>
              {isPending ? 'Agregando...' : 'Agregar integrante'}
            </Button>
          </form>

          {error && (
            <p className="rounded border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    </>
  )
}
