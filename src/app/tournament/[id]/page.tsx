import { getTournamentById } from "@/actions/tournament"
import { getTeamsByOrganization } from "@/actions/team"
import { getMatchesByTournament } from "@/actions/match"
import { calculateStandings } from "@/actions/standings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { FixtureGenerator } from "./components/fixture-generator"
import { MatchResultForm } from "./components/match-result-form"
import { MatchEventRecorder } from "./components/match-event-recorder"
import { TeamSelector, RemoveTeamButton } from "./components/team-selector"
import { TeamRosterManager } from "./components/team-roster-manager"
import { TournamentStatusControl } from "./components/tournament-status"
import { getFormatBySlug, getSportBySlug } from "@/features/sports/catalog"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Borrador', color: 'text-yellow-600 bg-yellow-100' },
  UPCOMING: { label: 'Por empezar', color: 'text-blue-600 bg-blue-100' },
  ACTIVE: { label: 'En curso', color: 'text-green-600 bg-green-100' },
  FINISHED: { label: 'Finalizado', color: 'text-gray-600 bg-gray-100' },
}

export default async function TournamentPage({ params }: { params: { id: string } }) {
  try {
    const tournament = await getTournamentById(params.id)
    const [allTeams, matches, standings] = await Promise.all([
      getTeamsByOrganization(tournament.organizationId),
      getMatchesByTournament(params.id),
      calculateStandings(params.id),
    ])

    const participantTeamIds = new Set(tournament.participants.map(p => p.teamId))
    const availableTeams = allTeams.filter(t => !participantTeamIds.has(t.id))
    const isDraft = tournament.status === 'DRAFT'
    const statusInfo = STATUS_LABELS[tournament.status] ?? { label: tournament.status, color: '' }

    const totalMatches = matches.length
    const playedMatches = matches.filter(m => m.status === 'FINISHED').length
    const sport = getSportBySlug(tournament.sportSlug)
    const format = getFormatBySlug(tournament.formatSlug)

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-6">
            <Link href={`/org/${tournament.organization.slug}`} className="text-sm text-accent hover:underline mb-2 block font-bold">
              ← Volver a {tournament.organization.name}
            </Link>
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">{tournament.name}</h1>
                {tournament.description && (
                  <p className="text-muted-foreground mt-1">{tournament.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                {totalMatches > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {playedMatches}/{totalMatches} partidos jugados
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-8">

              {/* Tabla de Posiciones */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Tabla de Posiciones</h2>
                <Card className="bg-card/80 border-border/50 shadow-xl">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-center">#</TableHead>
                          <TableHead>Equipo</TableHead>
                          <TableHead className="text-center w-10">PJ</TableHead>
                          <TableHead className="text-center w-10">G</TableHead>
                          <TableHead className="text-center w-10">E</TableHead>
                          <TableHead className="text-center w-10">P</TableHead>
                          <TableHead className="text-center w-10">GF</TableHead>
                          <TableHead className="text-center w-10">GC</TableHead>
                          <TableHead className="text-center w-12">DIF</TableHead>
                          <TableHead className="text-center w-12 font-bold">PTS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                              No hay datos aún. Los resultados aparecerán aquí.
                            </TableCell>
                          </TableRow>
                        ) : (
                          standings.map((row, index) => (
                            <TableRow
                              key={row.teamId}
                              className={index === 0 && row.points > 0 ? 'bg-yellow-50 font-semibold' : ''}
                            >
                              <TableCell className="text-center">
                                {index === 0 && standings.length > 1 && row.points > 0 ? '🥇' : index + 1}
                              </TableCell>
                              <TableCell className="font-medium">{row.teamName}</TableCell>
                              <TableCell className="text-center">{row.played}</TableCell>
                              <TableCell className="text-center">{row.won}</TableCell>
                              <TableCell className="text-center">{row.drawn}</TableCell>
                              <TableCell className="text-center">{row.lost}</TableCell>
                              <TableCell className="text-center">{row.goalsFor}</TableCell>
                              <TableCell className="text-center">{row.goalsAgainst}</TableCell>
                              <TableCell className="text-center">
                                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                              </TableCell>
                              <TableCell className="text-center font-bold text-base">{row.points}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>

              {/* Fixture */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Fixture</h2>
                  {tournament.rounds.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {tournament.rounds.length} fechas
                    </span>
                  )}
                </div>

                {tournament.rounds.length === 0 ? (
                  <Card className="bg-card/80 border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle>No hay fixture generado</CardTitle>
                      <CardDescription>
                        {isDraft
                          ? tournament.participants.length < 2
                            ? 'Agrega al menos 2 equipos para generar el fixture'
                            : 'Usa el panel lateral para generar el fixture'
                          : 'Este torneo no tiene fixture cargado'}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {tournament.rounds.map((round) => {
                      const roundMatches = round.matches
                      const roundPlayed = roundMatches.filter(m => m.status === 'FINISHED').length
                      const roundDone = roundPlayed === roundMatches.length

                      return (
                        <Card key={round.id} className={roundDone ? 'opacity-75 bg-card/80 border-border/50 shadow-xl' : 'bg-card/80 border-border/50 shadow-xl'}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">
                                {round.name || `Fecha ${round.number}`}
                              </CardTitle>
                              <span className="text-xs text-muted-foreground">
                                {roundPlayed}/{roundMatches.length} jugados
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {roundMatches.map((match) => {
                              const isMatchFinished = match.status === 'FINISHED'
                              const homeWon = isMatchFinished && match.homeScore! > match.awayScore!
                              const awayWon = isMatchFinished && match.awayScore! > match.homeScore!
                              const homeParticipant = tournament.participants.find((participant) => participant.teamId === match.homeTeamId)
                              const awayParticipant = tournament.participants.find((participant) => participant.teamId === match.awayTeamId)

                              return (
                                <div key={match.id} className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className={`font-medium truncate ${homeWon ? 'font-bold' : ''}`}>
                                        {match.homeTeam.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">vs</div>
                                      <div className={`font-medium truncate ${awayWon ? 'font-bold' : ''}`}>
                                        {match.awayTeam.name}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <MatchResultForm
                                        matchId={match.id}
                                        currentHomeScore={match.homeScore}
                                        currentAwayScore={match.awayScore}
                                        isFinished={isMatchFinished}
                                      />
                                    </div>
                                  </div>

                                  {homeParticipant && awayParticipant && (
                                    <MatchEventRecorder
                                      matchId={match.id}
                                      sportSlug={tournament.sportSlug}
                                      homeTeam={{
                                        id: homeParticipant.team.id,
                                        name: homeParticipant.team.name,
                                        members: homeParticipant.team.members,
                                      }}
                                      awayTeam={{
                                        id: awayParticipant.team.id,
                                        name: awayParticipant.team.name,
                                        members: awayParticipant.team.members,
                                      }}
                                      events={match.events}
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Estado del torneo */}
              <TournamentStatusControl
                tournamentId={params.id}
                currentStatus={tournament.status}
                hasFixture={tournament.rounds.length > 0}
              />

              {/* Equipos participantes */}
              <Card className="bg-card/80 border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle>Equipos Participantes</CardTitle>
                  <CardDescription>{tournament.participants.length} equipos inscritos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {tournament.participants.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay equipos aún</p>
                  ) : (
                    tournament.participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                        <div className="flex-1">
                          {isDraft && (
                            <RemoveTeamButton
                              tournamentId={params.id}
                              teamId={p.teamId}
                              teamName={p.team.name}
                            />
                          )}
                        </div>
                        <TeamRosterManager
                          tournamentId={params.id}
                          teamId={p.teamId}
                          teamName={p.team.name}
                          sportSlug={tournament.sportSlug}
                          members={p.team.members}
                        />
                      </div>
                    ))
                  )}
                  {isDraft && (
                    <TeamSelector
                      tournamentId={params.id}
                      availableTeams={availableTeams}
                    />
                  )}
                  {!isDraft && availableTeams.length > 0 && (
                    <p className="text-xs text-muted-foreground pt-2">
                      Cambia el torneo a Borrador para modificar equipos
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Generar fixture */}
              {isDraft && tournament.participants.length >= 2 && (
                <FixtureGenerator
                  tournamentId={params.id}
                  teamCount={tournament.participants.length}
                />
              )}

              {/* Información del torneo */}
              <Card className="bg-card/80 border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="font-medium">{format?.name ?? tournament.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deporte</span>
                    <span className="font-medium">{sport?.name ?? tournament.sportSlug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Victoria</span>
                    <span className="font-medium">{tournament.pointsForWin} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Empate</span>
                    <span className="font-medium">{tournament.pointsForDraw} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Derrota</span>
                    <span className="font-medium">{tournament.pointsForLoss} pts</span>
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
