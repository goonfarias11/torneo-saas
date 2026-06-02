'use client'

import { updateTournamentStatus, deleteTournament } from "@/actions/tournament"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

const TRANSITIONS: Record<string, { next: string; label: string; variant: 'default' | 'outline' | 'destructive' }[]> = {
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()
  const transitions = TRANSITIONS[currentStatus] ?? []

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateTournamentStatus(tournamentId, status)
    })
  }

  function handleDelete() {
    setShowDeleteModal(true)
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteTournament(tournamentId)
      if (result.success) {
        router.push(`/org/${result.organizationSlug}`)
      }
      setShowDeleteModal(false)
    })
  }

  if (transitions.length === 0 && currentStatus !== 'FINISHED') return null

  return (
    <>
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

    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <Card className="w-full max-w-md border-border/50 bg-card shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tight text-destructive">Eliminar torneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta acción eliminará el torneo y no se puede deshacer. ¿Querés continuar?
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="destructive"
                className="flex-1 font-bold"
                disabled={isPending}
                onClick={confirmDelete}
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </>
  )
}
