import { redirect } from "next/navigation"
import { createOrganization } from "@/actions/organization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function NewOrganizationPage() {
  async function handleCreateOrganization(formData: FormData) {
    "use server"
    try {
      const result = await createOrganization(formData)
      if (result.success) {
        redirect("/dashboard")
      }
    } catch (error: any) {
      // El error será mostrado en la UI
      console.error("Error creating organization:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5">
          <Link href="/dashboard" className="text-accent hover:underline font-bold">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <Card className="mb-6 bg-accent/10 border-accent/30">
          <CardHeader>
            <CardTitle className="text-accent text-xl font-black">⚠️ Base de Datos Requerida</CardTitle>
            <CardDescription className="text-foreground/80 font-medium">
              Esta funcionalidad requiere una base de datos PostgreSQL configurada.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            <p className="mb-3 font-semibold"><strong className="text-accent">Opciones rápidas y gratuitas:</strong></p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>
                Ve a <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-accent hover:text-accent/80">Neon.tech</a> o <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-accent hover:text-accent/80">Supabase.com</a>
              </li>
              <li>Crea una cuenta gratuita y un nuevo proyecto</li>
              <li>Copia el connection string de PostgreSQL</li>
              <li>Pégalo en el archivo <code className="bg-accent/20 px-1 rounded text-accent">.env</code> en la variable <code className="bg-accent/20 px-1 rounded text-accent">DATABASE_URL</code></li>
              <li>Ejecuta en la terminal: <code className="bg-accent/20 px-2 py-1 rounded block mt-1 text-accent font-mono">npm run db:push && npm run db:seed</code></li>
            </ol>
            <p className="text-xs text-muted-foreground">Una vez configurado, recarga esta página y podrás crear organizaciones.</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-black">Nueva Organización</CardTitle>
            <CardDescription>
              Crea una organización para gestionar torneos y equipos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreateOrganization} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la organización</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Liga Municipal de Fútbol"
                  required
                  minLength={3}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Describe tu organización..."
                  disabled
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled>
                  Crear Organización (DB requerida)
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Volver</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
