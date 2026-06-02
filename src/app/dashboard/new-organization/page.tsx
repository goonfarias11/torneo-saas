import { createOrganization } from "@/actions/organization"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function NewOrganizationPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createOrganization(formData)
    if (result.success) {
      redirect(`/org/${result.organizationSlug}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <Link href="/dashboard" className="text-sm text-accent hover:underline mb-2 block font-bold">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Nueva Organización</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <Card className="bg-card/80 border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Crear organización</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Una organización agrupa tus torneos y equipos. Podés tener una por liga, club o competencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Liga de Fútbol Barrial"
                  required
                  minLength={3}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Descripción breve"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 font-bold">Crear Organización</Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
