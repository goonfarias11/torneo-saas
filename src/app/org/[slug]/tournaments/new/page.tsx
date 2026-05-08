import { createTournament } from "@/actions/tournament"
import { getOrganizationBySlug } from "@/actions/organization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

export default async function NewTournamentPage({ params }: { params: { slug: string } }) {
  let org: any
  try {
    org = await getOrganizationBySlug(params.slug)
  } catch {
    notFound()
  }

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createTournament(org.id, formData)
    if (result.success) {
      redirect(`/tournament/${result.tournamentId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/org/${params.slug}`} className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Volver a {org.name}
          </Link>
          <h1 className="text-3xl font-bold">Nuevo Torneo</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Crear torneo</CardTitle>
            <CardDescription>Completa los datos del torneo</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" name="name" placeholder="Ej: Torneo Apertura 2025" required minLength={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input id="description" name="description" placeholder="Descripción breve del torneo" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Formato</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue="LEAGUE"
                  className="w-full p-2 border rounded bg-background text-sm"
                >
                  <option value="LEAGUE">Liga (todos contra todos)</option>
                </select>
                <p className="text-xs text-muted-foreground">Más formatos próximamente</p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Sistema de puntuación</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="pointsForWin" className="text-xs">Victoria</Label>
                    <Input id="pointsForWin" name="pointsForWin" type="number" min="0" max="10" defaultValue="3" className="text-center" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pointsForDraw" className="text-xs">Empate</Label>
                    <Input id="pointsForDraw" name="pointsForDraw" type="number" min="0" max="10" defaultValue="1" className="text-center" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pointsForLoss" className="text-xs">Derrota</Label>
                    <Input id="pointsForLoss" name="pointsForLoss" type="number" min="0" max="10" defaultValue="0" className="text-center" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">Crear Torneo</Button>
                <Button variant="outline" asChild>
                  <Link href={`/org/${params.slug}`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
