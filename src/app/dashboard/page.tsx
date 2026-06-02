import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserOrganizations } from "@/actions/organization"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trophy } from "lucide-react"
import { OrganizationDeleteButton } from "./organization-delete-button"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const organizations = await getUserOrganizations()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight">
            TORNEO<span className="text-accent">.</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <form action={async () => {
              "use server"
              const { signOut } = await import("@/lib/auth")
              await signOut()
            }}>
              <Button variant="ghost" type="submit" size="sm">Salir</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black tracking-tight">Mis Organizaciones</h2>
          <Button asChild className="font-bold">
            <Link href="/dashboard/new-organization">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Organización
            </Link>
          </Button>
        </div>

        {organizations.length === 0 ? (
          <Card className="bg-card/50 border-dashed border-2 border-border/50 max-w-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="w-5 h-5" /> ¡Empezá ahora!
              </CardTitle>
              <CardDescription className="text-base">
                Creá una organización para gestionar tus torneos y equipos.
                Podés tener una por liga, club o cualquier tipo de competencia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="font-bold">
                <Link href="/dashboard/new-organization">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear mi primera organización
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="bg-card/50 border-border/50 hover:bg-card hover:border-accent/30 transition-all group">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors">
                    {org.name}
                  </CardTitle>
                  <CardDescription>
                    {org.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {org.tournamentCount} torneos · {org.teamCount} equipos
                  </p>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1 font-bold" size="sm">
                      <Link href={`/org/${org.slug}`}>Ver organización →</Link>
                    </Button>
                    <OrganizationDeleteButton organizationId={org.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
