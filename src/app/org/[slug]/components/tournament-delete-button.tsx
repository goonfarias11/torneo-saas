'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTournament } from '@/actions/tournament'
import { Button } from '@/components/ui/button'

export function TournamentDeleteButton({ tournamentId }: { tournamentId: string }) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    setIsConfirming(true)
  }

  function cancelDelete() {
    setIsConfirming(false)
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteTournament(tournamentId)
      if (result.success) {
        router.refresh()
        router.push(`/org/${result.organizationSlug}`)
      }
      setIsConfirming(false)
    })
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        disabled={isPending}
        onClick={handleDelete}
      >
        Eliminar
      </Button>

      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-destructive mb-3">Eliminar torneo</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Esta acción eliminará el torneo y no se puede deshacer. ¿Deseas continuar?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
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
                onClick={cancelDelete}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
