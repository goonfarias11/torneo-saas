'use client'

import { generateFixtures } from "@/actions/match"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransition } from "react"

export function FixtureGenerator({ tournamentId }: { tournamentId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    startTransition(async () => {
      await generateFixtures(tournamentId)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Fixture</CardTitle>
        <CardDescription>
          Crea todos los partidos automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleGenerate} 
          disabled={isPending}
          className="w-full"
        >
          {isPending ? 'Generando...' : 'Generar Fixture'}
        </Button>
      </CardContent>
    </Card>
  )
}
