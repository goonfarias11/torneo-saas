'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { loginOrRegister } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ERROR_MESSAGES: Record<string, string> = {
  campos_vacios:       "Completá email y contraseña.",
  password_corta:      "La contraseña debe tener al menos 6 caracteres.",
  password_incorrecta: "Contraseña incorrecta.",
  db_error:            "Error al conectar con la base de datos.",
}

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await loginOrRegister(formData)
      // Si result es { ok: false }, mostramos el error.
      // Si es { ok: true } o un redirect, Next maneja la navegación.
      if (result && !result.ok) {
        setError(ERROR_MESSAGES[result.error] ?? "Error inesperado.")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <Link href="/" className="inline-block text-5xl font-black tracking-tight text-foreground hover:text-accent">
            TORNEO<span className="text-accent">.</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Gestión de torneos deportivos</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Ingresar</CardTitle>
            <CardDescription>
              La primera vez que usás un email se crea tu cuenta automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoComplete="current-password"
                  disabled={isPending}
                />
              </div>

              <Button type="submit" className="w-full font-bold mt-2" disabled={isPending}>
                {isPending ? "Ingresando..." : "Ingresar"}
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Si es tu primera vez, ingresá tu email y elegí una contraseña. Tu cuenta se crea sola.
        </p>

      </div>
    </div>
  )
}
