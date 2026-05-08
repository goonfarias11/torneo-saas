'use client'

import { updateTournamentStatus, deleteTournament } from "@/actions/tournament"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { TournamentStatus } from "@prisma/client"

const TRANSITIONS: Record<string, { next: TournamentStatus; label: string; variant: 'default' | 'outline' | 'destructive' }[]> = {
  DRAFT: [
    { next: 'UPCOMING', label: '📅 Publicar torneo', variant: 'default' },
    { next: 'ACTIVE', label: '▶️ Iniciar torneo', variant: 'default' },
  ],
  UPCOMING: [
    { next: 'ACTIVE', label: '▶️ Iniciar torneo', variant: 'default' },
    { next: 'DRAFT', label: '← Volver a borrador', variant: 'outline' },
  ],
  ACTIVE: [
    { next: 'FINISHED', label: '🏆 Finalizar torneo', variant: 'default' },
    { next: 'UPCOMING', label: '⏸ Pausar', variant: 'outline' },
  ],
  FINISHED: [
    { next: 'ACTIVE', label: '↩ Reabrir torneo', variant: 'outline' },
  ],
}

export function TournamentStatusControl({
  tournamentId,
  currentStatus,
  hasFixture,
}: {
  tournamentId: string
  currentStatus: string
  hasFixture: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const transitions = TRANSITIONS[currentStatus] ?? []

  function handleStatusChange(status: TournamentStatus) {
    startTransition(async () => {
      await updateTournamentStatus(tournamentId, status)
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este torneo? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      const result = await deleteTournament(tournamentId)
      if (result.success) {
        router.push(`/org/${result.organizationSlug}`)
      }
    })
  }

  if (transitions.length === 0 && currentStatus !== 'FINISHED') return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Acciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {transitions.map((t) => (
          <Button
            key={t.next}
            variant={t.variant}
            className="w-full"
            disabled={isPending}
            onClick={() => handleStatusChange(t.next)}
          >
            {isPending ? 'Actualizando...' : t.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isPending}
          onClick={handleDelete}
        >
          🗑️ Eliminar torneo
        </Button>
      </CardContent>
    </Card>
  )
}
