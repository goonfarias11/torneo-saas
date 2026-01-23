'use client'

import { updateMatchResult } from "@/actions/match"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"

export function MatchResultForm({ matchId }: { matchId: string }) {
  const [isPending, startTransition] = useTransition()
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const home = parseInt(homeScore)
    const away = parseInt(awayScore)
    
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      alert('Ingresa resultados válidos')
      return
    }

    startTransition(async () => {
      await updateMatchResult(matchId, home, away)
      setHomeScore('')
      setAwayScore('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <Input
        type="number"
        min="0"
        value={homeScore}
        onChange={(e) => setHomeScore(e.target.value)}
        placeholder="0"
        className="w-16 text-center"
        disabled={isPending}
      />
      <span className="text-muted-foreground">-</span>
      <Input
        type="number"
        min="0"
        value={awayScore}
        onChange={(e) => setAwayScore(e.target.value)}
        placeholder="0"
        className="w-16 text-center"
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? '...' : 'OK'}
      </Button>
    </form>
  )
}
