import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserOrganizations } from "@/actions/organization"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  let organizations: Awaited<ReturnType<typeof getUserOrganizations>> = []
  let hasDBError = false
  
  try {
    organizations = await getUserOrganizations()
  } catch (error) {
    console.error('Error getting organizations:', error)
    hasDBError = true
    organizations = []
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight">
            TORNEO<span className="text-accent">.</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-semibold">{session.user.email}</span>
            <form action={async () => {
              "use server"
              const { signOut } = await import("@/lib/auth")
              await signOut()
            }}>
              <Button variant="ghost" type="submit" className="font-semibold">Salir</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black tracking-tight">Mis Organizaciones</h2>
          <Button asChild className="font-bold shadow-lg shadow-accent/20">
            <Link href="/dashboard/new-organization">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Organización
            </Link>
          </Button>
        </div>

        {organizations.length === 0 ? (
          <Card className="bg-card/50 border-accent/30">
            <CardHeader>
              <CardTitle className="text-2xl font-black">
                {hasDBError ? '⚠️ Base de Datos No Configurada' : 'No tienes organizaciones'}
              </CardTitle>
              <CardDescription className="text-base">
                {hasDBError ? (
                  <>
                    La aplicación no puede conectarse a la base de datos.
                    <br /><br />
                    <strong className="text-accent">Para configurar la base de datos:</strong>
                  </>
                ) : (
                  'Para usar la aplicación completamente, necesitas configurar la base de datos PostgreSQL.'
                )}
                <br /><br />
                <strong className="text-accent">Opciones rápidas y gratuitas:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Neon.tech (gratis): <a href="https://neon.tech" target="_blank" className="text-accent hover:underline font-semibold">https://neon.tech</a></li>
                  <li>Supabase (gratis): <a href="https://supabase.com" target="_blank" className="text-accent hover:underline font-semibold">https://supabase.com</a></li>
                </ul>
                <br />
                <strong className="text-accent">Pasos:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Crea una cuenta y un nuevo proyecto</li>
                  <li>Copia la CONNECTION STRING (empieza con postgresql://)</li>
                  <li>En Vercel, ve a Settings → Environment Variables</li>
                  <li>Agrega DATABASE_URL con el connection string</li>
                  <li>Redeploy el proyecto</li>
                </ol>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild disabled className="font-bold">
                <Link href="/dashboard/new-organization">Crear Organización (requiere DB)</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="bg-card/50 border-border/50 hover:bg-card hover:border-accent/30 transition-all group">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors">{org.name}</CardTitle>
                  <CardDescription>
                    {org.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4 font-medium">
                    <p>Plan: <span className="font-bold text-foreground">{org.plan}</span></p>
                    <p>Rol: <span className="font-bold text-foreground">{org.role}</span></p>
                    <p className="text-accent font-semibold">{org.tournamentCount} torneos • {org.teamCount} equipos</p>
                  </div>
                  <Button asChild className="w-full font-bold">
                    <Link href={`/org/${org.slug}`}>Ver Organización</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
