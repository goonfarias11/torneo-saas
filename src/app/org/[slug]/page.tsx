import { getOrganizationBySlug } from "@/actions/organization"
import { getTournamentsByOrganization } from "@/actions/tournament"
import { getTeamsByOrganization } from "@/actions/team"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, Trophy, Users } from "lucide-react"
import { notFound } from "next/navigation"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:    { label: 'Borrador',     color: 'text-yellow-700 bg-yellow-100' },
  UPCOMING: { label: 'Por empezar',  color: 'text-blue-700 bg-blue-100' },
  ACTIVE:   { label: 'En curso',     color: 'text-green-700 bg-green-100' },
  FINISHED: { label: 'Finalizado',   color: 'text-gray-600 bg-gray-100' },
}

export default async function OrganizationPage({ params }: { params: { slug: string } }) {
  try {
    const org = await getOrganizationBySlug(params.slug)
    const tournaments = await getTournamentsByOrganization(org.id)
    const teams = await getTeamsByOrganization(org.id)

    const activeTournaments = tournaments.filter(t => t.status === 'ACTIVE')
    const draftTournaments = tournaments.filter(t => t.status === 'DRAFT')
    const finishedTournaments = tournaments.filter(t => t.status === 'FINISHED' || t.status === 'UPCOMING')

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <Link href="/dashboard" className="text-sm text-accent hover:underline mb-2 block font-bold">
                  ← Dashboard
                </Link>
                <h1 className="text-4xl font-black tracking-tight">{org.name}</h1>
                {org.description && (
                  <p className="text-muted-foreground mt-2 font-medium">{org.description}</p>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <span className="font-semibold">{tournaments.length}</span> torneos · <span className="font-semibold">{teams.length}</span> equipos
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-10">
          <div className="grid gap-12">

            {/* Torneos */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                  <Trophy className="w-7 h-7" /> Torneos
                </h2>
                <Button asChild className="font-bold">
                  <Link href={`/org/${params.slug}/tournaments/new`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Torneo
                  </Link>
                </Button>
              </div>

              {tournaments.length === 0 ? (
                <Card className="bg-card/50 border-dashed border-2 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">No hay torneos todavía</CardTitle>
                    <CardDescription>Crea tu primer torneo para empezar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href={`/org/${params.slug}/tournaments/new`}>Crear torneo</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Activos primero */}
                  {activeTournaments.length > 0 && (
                    <div>
                      <p className="text-xs uppercase font-bold text-muted-foreground mb-3 tracking-widest">En curso</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}
                      </div>
                    </div>
                  )}
                  {/* Borradores */}
                  {draftTournaments.length > 0 && (
                    <div>
                      <p className="text-xs uppercase font-bold text-muted-foreground mb-3 tracking-widest mt-6">En preparación</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {draftTournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}
                      </div>
                    </div>
                  )}
                  {/* Otros */}
                  {finishedTournaments.length > 0 && (
                    <div>
                      <p className="text-xs uppercase font-bold text-muted-foreground mb-3 tracking-widest mt-6">Historial</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {finishedTournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Equipos */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                  <Users className="w-7 h-7" /> Equipos
                </h2>
                <Button asChild className="font-bold">
                  <Link href={`/org/${params.slug}/teams/new`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Equipo
                  </Link>
                </Button>
              </div>

              {teams.length === 0 ? (
                <Card className="bg-card/50 border-dashed border-2 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">No hay equipos todavía</CardTitle>
                    <CardDescription>Crea equipos para luego agregarlos a un torneo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href={`/org/${params.slug}/teams/new`}>Crear equipo</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {teams.map((team) => (
                    <Card key={team.id} className="text-center bg-card/50 border-border/50 hover:border-accent/50 transition-all group cursor-default">
                      <CardHeader className="pb-2 pt-4 px-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-lg font-black">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <CardTitle className="text-sm font-bold leading-tight group-hover:text-accent transition-colors">
                          {team.name}
                        </CardTitle>
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

function TournamentCard({ tournament }: { tournament: any }) {
  const statusInfo = STATUS_LABELS[tournament.status] ?? { label: tournament.status, color: '' }
  return (
    <Card className="bg-card/50 border-border/50 hover:bg-card hover:border-accent/30 transition-all group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold tracking-tight group-hover:text-accent transition-colors leading-tight">
            {tournament.name}
          </CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap flex-shrink-0 ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        {tournament.description && (
          <CardDescription className="text-xs line-clamp-1">{tournament.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {tournament._count.participants} equipos · {tournament._count.matches} partidos
        </p>
        <Button asChild className="w-full font-bold" size="sm">
          <Link href={`/tournament/${tournament.id}`}>Ver torneo →</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
