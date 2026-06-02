import { redirect } from "next/navigation"
import { getOrganizationBySlug } from "@/actions/organization"
import { createTeam } from "@/actions/team"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default async function NewTeamPage({ params }: { params: { slug: string } }) {
  const org = await getOrganizationBySlug(params.slug)

  async function handleCreateTeam(formData: FormData) {
    "use server"
    const result = await createTeam(org.id, formData)
    if (result.success) {
      redirect(`/org/${params.slug}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <Link href={`/org/${params.slug}`} className="text-sm text-accent hover:underline mb-2 block font-bold">
            ← Volver a {org.name}
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Nuevo Equipo</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <Card className="bg-card/80 border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Nuevo Equipo</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Crea un equipo para {org.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del equipo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Real Madrid"
                  required
                  minLength={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shortName">Nombre corto (opcional)</Label>
                <Input
                  id="shortName"
                  name="shortName"
                  placeholder="Ej: RMA"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Describe el equipo..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 font-bold">
                  Crear Equipo
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
