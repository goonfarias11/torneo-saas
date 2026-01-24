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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <Link href="/dashboard" className="text-sm text-accent hover:underline mb-2 block font-bold">
                  ← Volver al Dashboard
                </Link>
                <h1 className="text-4xl font-black tracking-tight">{org.name}</h1>
                {org.description && (
                  <p className="text-muted-foreground mt-2 font-medium">{org.description}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Tu rol: <span className="font-bold text-accent">{org.userRole}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12">
          <div className="grid gap-12">
            {/* Torneos */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black tracking-tight">Torneos</h2>
                <Button asChild className="font-bold shadow-lg shadow-accent/20">
                  <Link href={`/org/${params.slug}/tournaments/new`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Torneo
                  </Link>
                </Button>
              </div>

              {tournaments.length === 0 ? (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">No hay torneos</CardTitle>
                    <CardDescription>Crea tu primer torneo</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tournaments.map((tournament) => (
                    <Card key={tournament.id} className="bg-card/50 border-border/50 hover:bg-card hover:border-accent/30 transition-all group">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors">{tournament.name}</CardTitle>
                        <CardDescription>
                          {tournament.description || "Sin descripción"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4 font-medium">
                          <p>Estado: <span className="font-bold text-foreground">{tournament.status}</span></p>
                          <p>Tipo: <span className="font-bold text-foreground">{tournament.type}</span></p>
                          <p className="text-accent font-semibold">{tournament._count.participants} equipos • {tournament._count.matches} partidos</p>
                        </div>
                        <Button asChild className="w-full font-bold">
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black tracking-tight">Equipos</h2>
                <Button asChild className="font-bold shadow-lg shadow-accent/20">
                  <Link href={`/org/${params.slug}/teams/new`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Equipo
                  </Link>
                </Button>
              </div>

              {teams.length === 0 ? (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">No hay equipos</CardTitle>
                    <CardDescription>Crea tus primeros equipos</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {teams.map((team) => (
                    <Card key={team.id} className="text-center bg-card/50 border-border/50 hover:bg-card hover:border-accent/30 transition-all group">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold group-hover:text-accent transition-colors">{team.name}</CardTitle>
                        {team.shortName && (
                          <CardDescription className="text-xs font-semibold">{team.shortName}</CardDescription>
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
