'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#0b1220', color: '#fff' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.25em', color: '#8b5cf6', fontSize: 12 }}>Error global</p>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>La app encontró un error inesperado</h1>
            <p style={{ color: '#cbd5e1', marginTop: 12 }}>Reintenta o recarga la página para continuar.</p>
            <button
              onClick={reset}
              style={{ marginTop: 18, borderRadius: 8, background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
