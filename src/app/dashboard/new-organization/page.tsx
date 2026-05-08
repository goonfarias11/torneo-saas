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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Nueva Organización</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Crear organización</CardTitle>
            <CardDescription>
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
                <Button type="submit" className="flex-1">Crear Organización</Button>
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
