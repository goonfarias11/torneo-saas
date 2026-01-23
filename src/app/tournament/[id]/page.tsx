import { getTournamentById, updateTournamentStatus, addTeamToTournament } from "@/actions/tournament"
import { getTeamsByOrganization } from "@/actions/team"
import { generateFixtures, getMatchesByTournament, updateMatchResult } from "@/actions/match"
import { calculateStandings } from "@/actions/standings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TournamentStatus } from "@prisma/client"
import { FixtureGenerator } from "./components/fixture-generator"
import { MatchResultForm } from "./components/match-result-form"
import { TeamSelector } from "./components/team-selector"

export default async function TournamentPage({ params }: { params: { id: string } }) {
  try {
    const tournament = await getTournamentById(params.id)
    const allTeams = await getTeamsByOrganization(tournament.organizationId)
    const matches = await getMatchesByTournament(params.id)
    const standings = await calculateStandings(params.id)

    const participantTeamIds = new Set(tournament.participants.map(p => p.teamId))
    const availableTeams = allTeams.filter(t => !participantTeamIds.has(t.id))

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href={`/org/${tournament.organization.slug}`} className="text-sm text-blue-600 hover:underline mb-2 block">
              ← Volver a {tournament.organization.name}
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{tournament.name}</h1>
                {tournament.description && (
                  <p className="text-muted-foreground mt-1">{tournament.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Estado</div>
                <div className="text-lg font-bold">{tournament.status}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabla de posiciones */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Tabla de Posiciones</h2>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Equipo</TableHead>
                          <TableHead className="text-center">PJ</TableHead>
                          <TableHead className="text-center">G</TableHead>
                          <TableHead className="text-center">E</TableHead>
                          <TableHead className="text-center">P</TableHead>
                          <TableHead className="text-center">GF</TableHead>
                          <TableHead className="text-center">GC</TableHead>
                          <TableHead className="text-center">DIF</TableHead>
                          <TableHead className="text-center font-bold">PTS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                              No hay datos aún
                            </TableCell>
                          </TableRow>
                        ) : (
                          standings.map((row, index) => (
                            <TableRow key={row.teamId}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell className="font-medium">{row.teamName}</TableCell>
                              <TableCell className="text-center">{row.played}</TableCell>
                              <TableCell className="text-center">{row.won}</TableCell>
                              <TableCell className="text-center">{row.drawn}</TableCell>
                              <TableCell className="text-center">{row.lost}</TableCell>
                              <TableCell className="text-center">{row.goalsFor}</TableCell>
                              <TableCell className="text-center">{row.goalsAgainst}</TableCell>
                              <TableCell className="text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</TableCell>
                              <TableCell className="text-center font-bold">{row.points}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>

              {/* Fixtures */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Fixture</h2>
                {tournament.rounds.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No hay fixture generado</CardTitle>
                      <CardDescription>
                        Agrega equipos al torneo y genera el fixture
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {tournament.rounds.map((round) => (
                      <Card key={round.id}>
                        <CardHeader>
                          <CardTitle>{round.name || `Fecha ${round.number}`}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {round.matches.map((match) => (
                            <div key={match.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{match.homeTeam.name}</div>
                                <div className="text-sm text-muted-foreground">vs</div>
                                <div className="font-medium">{match.awayTeam.name}</div>
                              </div>
                              {match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null ? (
                                <div className="text-center px-4">
                                  <div className="text-2xl font-bold">
                                    {match.homeScore} - {match.awayScore}
                                  </div>
                                  <div className="text-xs text-muted-foreground">FINALIZADO</div>
                                </div>
                              ) : (
                                <MatchResultForm matchId={match.id} />
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agregar equipos */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipos Participantes</CardTitle>
                  <CardDescription>
                    {tournament.participants.length} equipos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tournament.participants.map((p) => (
                    <div key={p.id} className="text-sm p-2 bg-muted rounded">
                      {p.team.name}
                    </div>
                  ))}
                  {availableTeams.length > 0 && tournament.status === 'DRAFT' && (
                    <TeamSelector
                      tournamentId={params.id}
                      availableTeams={availableTeams}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Generar fixture */}
              {tournament.status === 'DRAFT' && tournament.participants.length >= 2 && (
                <FixtureGenerator tournamentId={params.id} />
              )}

              {/* Información */}
              <Card>
                <CardHeader>
                  <CardTitle>Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    <span className="font-medium">{tournament.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Puntos por victoria:</span>{" "}
                    <span className="font-medium">{tournament.pointsForWin}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Puntos por empate:</span>{" "}
                    <span className="font-medium">{tournament.pointsForDraw}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Puntos por derrota:</span>{" "}
                    <span className="font-medium">{tournament.pointsForLoss}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
