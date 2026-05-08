'use client'

import { generateFixtures } from "@/actions/match"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransition } from "react"

export function FixtureGenerator({ tournamentId, teamCount }: { tournamentId: string; teamCount: number }) {
  const [isPending, startTransition] = useTransition()

  const numRounds = teamCount % 2 === 0 ? teamCount - 1 : teamCount
  const matchesPerRound = Math.floor(teamCount / 2)

  function handleGenerate() {
    if (!confirm(`¿Generar fixture con ${teamCount} equipos? Esto eliminará el fixture actual si existe.`)) return
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
          onClick={handleGenerate}
          disabled={isPending}
          className="w-full"
          variant="default"
        >
          {isPending ? 'Generando...' : '⚡ Generar Fixture'}
        </Button>
      </CardContent>
    </Card>
  )
}
