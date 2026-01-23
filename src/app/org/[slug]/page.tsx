import { getOrganizationBySlug } from "@/actions/organization"
import { getTournamentsByOrganization } from "@/actions/tournament"
import { getTeamsByOrganization } from "@/actions/team"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { notFound } from "next/navigation"

export default async function OrganizationPage({ params }: { params: { slug: string } }) {
  try {
    const org = await getOrganizationBySlug(params.slug)
    const tournaments = await getTournamentsByOrganization(org.id)
    const teams = await getTeamsByOrganization(org.id)

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 block">
                  ← Volver al Dashboard
                </Link>
                <h1 className="text-3xl font-bold">{org.name}</h1>
                {org.description && (
                  <p className="text-muted-foreground mt-1">{org.description}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Tu rol: <span className="font-medium">{org.userRole}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Torneos */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Torneos</h2>
                <Button asChild>
                  <Link href={`/org/${params.slug}/tournaments/new`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Torneo
                  </Link>
                </Button>
              </div>

              {tournaments.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No hay torneos</CardTitle>
                    <CardDescription>Crea tu primer torneo</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournaments.map((tournament) => (
                    <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle>{tournament.name}</CardTitle>
                        <CardDescription>
                          {tournament.description || "Sin descripción"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <p>Estado: <span className="font-medium">{tournament.status}</span></p>
                          <p>Tipo: <span className="font-medium">{tournament.type}</span></p>
                          <p>{tournament._count.participants} equipos • {tournament._count.matches} partidos</p>
                        </div>
                        <Button asChild className="w-full">
                          <Link href={`/tournament/${tournament.id}`}>Ver Torneo</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Equipos */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Equipos</h2>
                <Button asChild>
                  <Link href={`/org/${params.slug}/teams/new`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Equipo
                  </Link>
                </Button>
              </div>

              {teams.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No hay equipos</CardTitle>
                    <CardDescription>Crea tus primeros equipos</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {teams.map((team) => (
                    <Card key={team.id} className="text-center">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{team.name}</CardTitle>
                        {team.shortName && (
                          <CardDescription className="text-xs">{team.shortName}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
