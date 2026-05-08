'use client'

import { updateMatchResult, resetMatchResult } from "@/actions/match"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useTransition } from "react"

interface Props {
  matchId: string
  currentHomeScore?: number | null
  currentAwayScore?: number | null
  isFinished?: boolean
}

export function MatchResultForm({ matchId, currentHomeScore, currentAwayScore, isFinished }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(!isFinished)
  const [homeScore, setHomeScore] = useState(currentHomeScore?.toString() ?? '')
  const [awayScore, setAwayScore] = useState(currentAwayScore?.toString() ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const home = parseInt(homeScore)
    const away = parseInt(awayScore)
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      alert('Ingresa resultados válidos (números enteros ≥ 0)')
      return
    }
    startTransition(async () => {
      await updateMatchResult(matchId, home, away)
      setIsEditing(false)
    })
  }

  function handleReset() {
    if (!confirm('¿Borrar el resultado de este partido?')) return
    startTransition(async () => {
      await resetMatchResult(matchId)
      setHomeScore('')
      setAwayScore('')
      setIsEditing(true)
    })
  }

  if (isFinished && !isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-center">
          <div className="text-2xl font-bold tabular-nums">
            {currentHomeScore} - {currentAwayScore}
          </div>
          <div className="text-xs text-muted-foreground">FINALIZADO</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="text-xs text-muted-foreground"
        >
          ✏️
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <Input
        type="number"
        min="0"
        max="99"
        value={homeScore}
        onChange={(e) => setHomeScore(e.target.value)}
        placeholder="0"
        className="w-14 text-center px-1"
        disabled={isPending}
      />
      <span className="text-muted-foreground font-bold">-</span>
      <Input
        type="number"
        min="0"
        max="99"
        value={awayScore}
        onChange={(e) => setAwayScore(e.target.value)}
        placeholder="0"
        className="w-14 text-center px-1"
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? '...' : '✓'}
      </Button>
      {isFinished && (
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
          ✕
        </Button>
      )}
      {isFinished && (
        <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={isPending} className="text-destructive">
          🗑️
        </Button>
      )}
    </form>
  )
}
