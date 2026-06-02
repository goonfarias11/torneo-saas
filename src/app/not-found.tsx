import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-xl rounded-2xl border border-border/50 bg-card/80 p-8 shadow-xl text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-accent font-semibold">404</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">No encontramos esa página</h1>
        <p className="mt-4 text-muted-foreground">
          La ruta que intentaste abrir no existe o ya no está disponible.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Volver al dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
