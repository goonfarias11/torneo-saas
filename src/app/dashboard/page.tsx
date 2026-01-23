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

  const organizations = await getUserOrganizations()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <form action={async () => {
              "use server"
              const { signOut } = await import("@/lib/auth")
              await signOut()
            }}>
              <Button variant="ghost" type="submit">Salir</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Mis Organizaciones</h2>
          <Button asChild>
            <Link href="/dashboard/new-organization">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Organización
            </Link>
          </Button>
        </div>

        {organizations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No tienes organizaciones</CardTitle>
              <CardDescription>
                Para usar la aplicación completamente, necesitas configurar la base de datos PostgreSQL.
                <br /><br />
                <strong>Opciones rápidas:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Neon.tech (gratis): <a href="https://neon.tech" target="_blank" className="text-blue-600 hover:underline">https://neon.tech</a></li>
                  <li>Supabase (gratis): <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">https://supabase.com</a></li>
                </ul>
                <br />
                Luego configura DATABASE_URL en el archivo .env y ejecuta: npm run db:push
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild disabled>
                <Link href="/dashboard/new-organization">Crear Organización (requiere DB)</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>
                    {org.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p>Plan: <span className="font-medium">{org.plan}</span></p>
                    <p>Rol: <span className="font-medium">{org.role}</span></p>
                    <p>{org.tournamentCount} torneos • {org.teamCount} equipos</p>
                  </div>
                  <Button asChild className="w-full">
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
