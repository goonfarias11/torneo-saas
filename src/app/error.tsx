'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-xl rounded-2xl border border-border/50 bg-card/80 p-8 shadow-xl text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-accent font-semibold">Error</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Algo salió mal</h1>
        <p className="mt-4 text-muted-foreground">
          Se produjo un error inesperado al cargar esta vista. Podés reintentar ahora.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </main>
  )
}
