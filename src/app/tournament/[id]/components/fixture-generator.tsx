'use client'

import { generateFixtures } from "@/actions/match"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useTransition } from "react"

export function FixtureGenerator({ tournamentId, teamCount }: { tournamentId: string; teamCount: number }) {
  const [isPending, startTransition] = useTransition()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const numRounds = teamCount % 2 === 0 ? teamCount - 1 : teamCount
  const matchesPerRound = Math.floor(teamCount / 2)

  function handleGenerate() {
    setShowConfirmModal(false)
    startTransition(async () => {
      const result = await generateFixtures(tournamentId)
      if (result.success) {
        // revalidation handles refresh
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Fixture</CardTitle>
        <CardDescription>
          Round-robin: {numRounds} fechas × {matchesPerRound} partidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => setShowConfirmModal(true)}
          disabled={isPending}
          className="w-full"
          variant="default"
        >
          {isPending ? 'Generando...' : '⚡ Generar Fixture'}
        </Button>
      </CardContent>

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fixture-confirm-title"
        >
          <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-xl">
            <h3 id="fixture-confirm-title" className="text-lg font-semibold">
              Generar fixture
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿Generar fixture con {teamCount} equipos? Esto eliminará el fixture actual si existe.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handleGenerate} disabled={isPending}>
                {isPending ? 'Generando...' : 'Generar fixture'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
