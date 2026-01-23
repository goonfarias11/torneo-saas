import { redirect } from "next/navigation"
import { getOrganizationBySlug } from "@/actions/organization"
import { createTournament } from "@/actions/tournament"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default async function NewTournamentPage({ params }: { params: { slug: string } }) {
  const org = await getOrganizationBySlug(params.slug)

  async function handleCreateTournament(formData: FormData) {
    "use server"
    const result = await createTournament(org.id, formData)
    if (result.success) {
      redirect(`/tournament/${result.tournamentId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/org/${params.slug}`} className="text-blue-600 hover:underline">
            ← Volver a {org.name}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Torneo</CardTitle>
            <CardDescription>
              Crea un torneo para {org.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreateTournament} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del torneo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Torneo Apertura 2026"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Describe el torneo..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Crear Torneo
                </Button>
                <Button type="button" variant="outline" asChild>
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
