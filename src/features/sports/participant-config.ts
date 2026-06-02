export type RosterMemberType = 'PLAYER' | 'COACH' | 'STAFF'

export interface SportRosterRole {
  slug: string
  label: string
  type: RosterMemberType
}

export interface SportMatchEventDefinition {
  slug: string
  label: string
  statSlug: string
  value: number
  appliesTo: 'player' | 'team' | 'staff'
  requiresMinute?: boolean
  requiresRelatedPerson?: boolean
}

export interface SportLeaderboardDefinition {
  slug: string
  label: string
  statSlug: string
  order: 'asc' | 'desc'
  scope: 'player' | 'team'
}

export interface SportParticipantConfig {
  positions: SportRosterRole[]
  staffRoles: SportRosterRole[]
  matchEvents: SportMatchEventDefinition[]
  leaderboards: SportLeaderboardDefinition[]
  statistics: Array<{ slug: string; label: string; aggregation: 'sum' | 'avg' | 'max' | 'min' }>
  requiredRosterSize: number
  maxRosterSize: number
}

const footballLikeEvents: SportMatchEventDefinition[] = [
  { slug: 'goal', label: 'Gol', statSlug: 'goals', value: 1, appliesTo: 'player', requiresMinute: true },
  { slug: 'assist', label: 'Asistencia', statSlug: 'assists', value: 1, appliesTo: 'player', requiresMinute: true, requiresRelatedPerson: true },
  { slug: 'yellow_card', label: 'Tarjeta amarilla', statSlug: 'yellow_cards', value: 1, appliesTo: 'player', requiresMinute: true },
  { slug: 'red_card', label: 'Tarjeta roja', statSlug: 'red_cards', value: 1, appliesTo: 'player', requiresMinute: true },
  { slug: 'own_goal', label: 'Autogol', statSlug: 'own_goals', value: 1, appliesTo: 'player', requiresMinute: true },
  { slug: 'penalty_scored', label: 'Penal convertido', statSlug: 'penalties_scored', value: 1, appliesTo: 'player', requiresMinute: true },
  { slug: 'penalty_missed', label: 'Penal fallado', statSlug: 'penalties_missed', value: 1, appliesTo: 'player', requiresMinute: true },
  { slug: 'save', label: 'Atajada', statSlug: 'saves', value: 1, appliesTo: 'player', requiresMinute: true },
  { slug: 'minutes_played', label: 'Minutos jugados', statSlug: 'minutes_played', value: 1, appliesTo: 'player' },
]

const footballLikeLeaderboards: SportLeaderboardDefinition[] = [
  { slug: 'top_scorers', label: 'Goleadores', statSlug: 'goals', order: 'desc', scope: 'player' },
  { slug: 'top_assists', label: 'Asistidores', statSlug: 'assists', order: 'desc', scope: 'player' },
  { slug: 'clean_sheets', label: 'Vallas menos vencidas', statSlug: 'clean_sheets', order: 'desc', scope: 'player' },
  { slug: 'yellow_cards', label: 'Tarjetas amarillas', statSlug: 'yellow_cards', order: 'desc', scope: 'player' },
  { slug: 'red_cards', label: 'Tarjetas rojas', statSlug: 'red_cards', order: 'desc', scope: 'player' },
]

const defaultStaff: SportRosterRole[] = [
  { slug: 'head_coach', label: 'DT', type: 'COACH' },
  { slug: 'assistant_coach', label: 'Ayudante', type: 'COACH' },
  { slug: 'fitness_coach', label: 'Preparador fisico', type: 'STAFF' },
  { slug: 'doctor', label: 'Medico', type: 'STAFF' },
  { slug: 'delegate', label: 'Delegado', type: 'STAFF' },
  { slug: 'manager', label: 'Manager', type: 'STAFF' },
  { slug: 'custom_staff', label: 'Staff personalizado', type: 'STAFF' },
]

function config(input: SportParticipantConfig): SportParticipantConfig {
  return input
}

export const SPORT_PARTICIPANT_CONFIGS: Record<string, SportParticipantConfig> = {
  football: config({
    positions: [
      { slug: 'goalkeeper', label: 'Arquero', type: 'PLAYER' },
      { slug: 'defender', label: 'Defensor', type: 'PLAYER' },
      { slug: 'midfielder', label: 'Mediocampista', type: 'PLAYER' },
      { slug: 'forward', label: 'Delantero', type: 'PLAYER' },
    ],
    staffRoles: defaultStaff,
    matchEvents: footballLikeEvents,
    leaderboards: footballLikeLeaderboards,
    statistics: footballLikeEvents.map((event) => ({ slug: event.statSlug, label: event.label, aggregation: 'sum' })),
    requiredRosterSize: 7,
    maxRosterSize: 30,
  }),
  futsal: config({
    positions: [
      { slug: 'goalkeeper', label: 'Arquero', type: 'PLAYER' },
      { slug: 'defender', label: 'Cierre', type: 'PLAYER' },
      { slug: 'wing', label: 'Ala', type: 'PLAYER' },
      { slug: 'pivot', label: 'Pivot', type: 'PLAYER' },
    ],
    staffRoles: defaultStaff,
    matchEvents: footballLikeEvents,
    leaderboards: footballLikeLeaderboards,
    statistics: footballLikeEvents.map((event) => ({ slug: event.statSlug, label: event.label, aggregation: 'sum' })),
    requiredRosterSize: 5,
    maxRosterSize: 14,
  }),
  'football-7': config({
    positions: [
      { slug: 'goalkeeper', label: 'Arquero', type: 'PLAYER' },
      { slug: 'defender', label: 'Defensor', type: 'PLAYER' },
      { slug: 'midfielder', label: 'Mediocampista', type: 'PLAYER' },
      { slug: 'forward', label: 'Delantero', type: 'PLAYER' },
    ],
    staffRoles: defaultStaff,
    matchEvents: footballLikeEvents,
    leaderboards: footballLikeLeaderboards,
    statistics: footballLikeEvents.map((event) => ({ slug: event.statSlug, label: event.label, aggregation: 'sum' })),
    requiredRosterSize: 5,
    maxRosterSize: 16,
  }),
  'football-5': config({
    positions: [
      { slug: 'goalkeeper', label: 'Arquero', type: 'PLAYER' },
      { slug: 'field_player', label: 'Jugador de campo', type: 'PLAYER' },
    ],
    staffRoles: defaultStaff,
    matchEvents: footballLikeEvents,
    leaderboards: footballLikeLeaderboards,
    statistics: footballLikeEvents.map((event) => ({ slug: event.statSlug, label: event.label, aggregation: 'sum' })),
    requiredRosterSize: 4,
    maxRosterSize: 12,
  }),
  basketball: config({
    positions: [
      { slug: 'point_guard', label: 'Base', type: 'PLAYER' },
      { slug: 'shooting_guard', label: 'Escolta', type: 'PLAYER' },
      { slug: 'small_forward', label: 'Alero', type: 'PLAYER' },
      { slug: 'power_forward', label: 'Ala-Pivot', type: 'PLAYER' },
      { slug: 'center', label: 'Pivot', type: 'PLAYER' },
    ],
    staffRoles: defaultStaff,
    matchEvents: [
      { slug: 'point', label: 'Punto', statSlug: 'points', value: 1, appliesTo: 'player' },
      { slug: 'three_pointer', label: 'Triple', statSlug: 'three_pointers', value: 1, appliesTo: 'player' },
      { slug: 'rebound', label: 'Rebote', statSlug: 'rebounds', value: 1, appliesTo: 'player' },
      { slug: 'assist', label: 'Asistencia', statSlug: 'assists', value: 1, appliesTo: 'player' },
      { slug: 'steal', label: 'Robo', statSlug: 'steals', value: 1, appliesTo: 'player' },
      { slug: 'block', label: 'Bloqueo', statSlug: 'blocks', value: 1, appliesTo: 'player' },
    ],
    leaderboards: [
      { slug: 'top_points', label: 'Maximos anotadores', statSlug: 'points', order: 'desc', scope: 'player' },
      { slug: 'top_assists', label: 'Asistencias', statSlug: 'assists', order: 'desc', scope: 'player' },
      { slug: 'top_rebounds', label: 'Rebotes', statSlug: 'rebounds', order: 'desc', scope: 'player' },
    ],
    statistics: [
      { slug: 'points', label: 'Puntos', aggregation: 'sum' },
      { slug: 'assists', label: 'Asistencias', aggregation: 'sum' },
      { slug: 'rebounds', label: 'Rebotes', aggregation: 'sum' },
    ],
    requiredRosterSize: 5,
    maxRosterSize: 15,
  }),
  volleyball: config({
    positions: [
      { slug: 'setter', label: 'Armador', type: 'PLAYER' },
      { slug: 'opposite', label: 'Opuesto', type: 'PLAYER' },
      { slug: 'middle_blocker', label: 'Central', type: 'PLAYER' },
      { slug: 'outside_hitter', label: 'Punta', type: 'PLAYER' },
      { slug: 'libero', label: 'Libero', type: 'PLAYER' },
    ],
    staffRoles: defaultStaff,
    matchEvents: [
      { slug: 'point', label: 'Punto', statSlug: 'points', value: 1, appliesTo: 'player' },
      { slug: 'attack_point', label: 'Punto de ataque', statSlug: 'attack_points', value: 1, appliesTo: 'player' },
      { slug: 'block', label: 'Bloqueo', statSlug: 'blocks', value: 1, appliesTo: 'player' },
      { slug: 'ace', label: 'Ace', statSlug: 'aces', value: 1, appliesTo: 'player' },
      { slug: 'dig', label: 'Defensa', statSlug: 'digs', value: 1, appliesTo: 'player' },
    ],
    leaderboards: [
      { slug: 'top_points', label: 'Maximos anotadores', statSlug: 'points', order: 'desc', scope: 'player' },
      { slug: 'top_blocks', label: 'Bloqueos', statSlug: 'blocks', order: 'desc', scope: 'player' },
      { slug: 'top_aces', label: 'Aces', statSlug: 'aces', order: 'desc', scope: 'player' },
    ],
    statistics: [
      { slug: 'points', label: 'Puntos', aggregation: 'sum' },
      { slug: 'blocks', label: 'Bloqueos', aggregation: 'sum' },
      { slug: 'aces', label: 'Aces', aggregation: 'sum' },
    ],
    requiredRosterSize: 6,
    maxRosterSize: 14,
  }),
  rugby: config({
    positions: [
      { slug: 'forward', label: 'Forward', type: 'PLAYER' },
      { slug: 'back', label: 'Back', type: 'PLAYER' },
    ],
    staffRoles: [
      { slug: 'head_coach', label: 'Head Coach', type: 'COACH' },
      ...defaultStaff.filter((role) => role.slug !== 'head_coach'),
    ],
    matchEvents: [
      { slug: 'try', label: 'Try', statSlug: 'tries', value: 1, appliesTo: 'player', requiresMinute: true },
      { slug: 'conversion', label: 'Conversion', statSlug: 'conversions', value: 1, appliesTo: 'player', requiresMinute: true },
      { slug: 'penalty_goal', label: 'Penal', statSlug: 'penalty_goals', value: 1, appliesTo: 'player', requiresMinute: true },
      { slug: 'yellow_card', label: 'Tarjeta amarilla', statSlug: 'yellow_cards', value: 1, appliesTo: 'player', requiresMinute: true },
    ],
    leaderboards: [
      { slug: 'top_tries', label: 'Tries', statSlug: 'tries', order: 'desc', scope: 'player' },
      { slug: 'top_conversions', label: 'Conversiones', statSlug: 'conversions', order: 'desc', scope: 'player' },
    ],
    statistics: [
      { slug: 'tries', label: 'Tries', aggregation: 'sum' },
      { slug: 'conversions', label: 'Conversiones', aggregation: 'sum' },
    ],
    requiredRosterSize: 15,
    maxRosterSize: 23,
  }),
  esports: config({
    positions: [
      { slug: 'player', label: 'Player', type: 'PLAYER' },
      { slug: 'captain', label: 'Captain', type: 'PLAYER' },
    ],
    staffRoles: [
      { slug: 'coach', label: 'Coach', type: 'COACH' },
      { slug: 'analyst', label: 'Analyst', type: 'STAFF' },
      { slug: 'manager', label: 'Manager', type: 'STAFF' },
      { slug: 'custom_staff', label: 'Staff personalizado', type: 'STAFF' },
    ],
    matchEvents: [
      { slug: 'kill', label: 'Kill', statSlug: 'kills', value: 1, appliesTo: 'player' },
      { slug: 'death', label: 'Death', statSlug: 'deaths', value: 1, appliesTo: 'player' },
      { slug: 'assist', label: 'Assist', statSlug: 'assists', value: 1, appliesTo: 'player' },
      { slug: 'mvp', label: 'MVP', statSlug: 'mvps', value: 1, appliesTo: 'player' },
    ],
    leaderboards: [
      { slug: 'top_kills', label: 'Kills', statSlug: 'kills', order: 'desc', scope: 'player' },
      { slug: 'top_kda', label: 'KDA', statSlug: 'kills', order: 'desc', scope: 'player' },
      { slug: 'top_mvps', label: 'MVPs', statSlug: 'mvps', order: 'desc', scope: 'player' },
    ],
    statistics: [
      { slug: 'kills', label: 'Kills', aggregation: 'sum' },
      { slug: 'deaths', label: 'Deaths', aggregation: 'sum' },
      { slug: 'assists', label: 'Assists', aggregation: 'sum' },
      { slug: 'mvps', label: 'MVPs', aggregation: 'sum' },
    ],
    requiredRosterSize: 1,
    maxRosterSize: 10,
  }),
  mma: config({
    positions: [{ slug: 'fighter', label: 'Peleador', type: 'PLAYER' }],
    staffRoles: defaultStaff,
    matchEvents: [
      { slug: 'knockout', label: 'Knockout', statSlug: 'knockouts', value: 1, appliesTo: 'player' },
      { slug: 'submission', label: 'Sumision', statSlug: 'submissions', value: 1, appliesTo: 'player' },
      { slug: 'decision', label: 'Decision', statSlug: 'decisions', value: 1, appliesTo: 'player' },
    ],
    leaderboards: [
      { slug: 'top_knockouts', label: 'Knockouts', statSlug: 'knockouts', order: 'desc', scope: 'player' },
      { slug: 'top_submissions', label: 'Sumisiones', statSlug: 'submissions', order: 'desc', scope: 'player' },
    ],
    statistics: [
      { slug: 'knockouts', label: 'Knockouts', aggregation: 'sum' },
      { slug: 'submissions', label: 'Sumisiones', aggregation: 'sum' },
    ],
    requiredRosterSize: 1,
    maxRosterSize: 1,
  }),
}

const genericIndividualConfig = config({
  positions: [{ slug: 'participant', label: 'Participante', type: 'PLAYER' }],
  staffRoles: defaultStaff,
  matchEvents: [
    { slug: 'win', label: 'Victoria', statSlug: 'wins', value: 1, appliesTo: 'player' },
    { slug: 'loss', label: 'Derrota', statSlug: 'losses', value: 1, appliesTo: 'player' },
    { slug: 'point', label: 'Punto', statSlug: 'points', value: 1, appliesTo: 'player' },
  ],
  leaderboards: [
    { slug: 'ranking', label: 'Ranking', statSlug: 'points', order: 'desc', scope: 'player' },
    { slug: 'wins', label: 'Victorias', statSlug: 'wins', order: 'desc', scope: 'player' },
  ],
  statistics: [
    { slug: 'wins', label: 'Victorias', aggregation: 'sum' },
    { slug: 'losses', label: 'Derrotas', aggregation: 'sum' },
    { slug: 'points', label: 'Puntos', aggregation: 'sum' },
  ],
  requiredRosterSize: 1,
  maxRosterSize: 4,
})

export function getSportParticipantConfig(sportSlug: string): SportParticipantConfig {
  return SPORT_PARTICIPANT_CONFIGS[sportSlug] ?? genericIndividualConfig
}

export function getSportEventDefinition(sportSlug: string, eventSlug: string) {
  return getSportParticipantConfig(sportSlug).matchEvents.find((event) => event.slug === eventSlug)
}
