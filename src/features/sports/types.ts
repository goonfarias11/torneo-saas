export type ParticipantType = 'individual' | 'doubles' | 'team' | 'mixed'

export type CompetitionFormatSlug =
  | 'league'
  | 'round-robin'
  | 'single-elimination'
  | 'double-elimination'
  | 'swiss'
  | 'groups-playoffs'
  | 'ladder'
  | 'king-of-the-hill'
  | 'arena'
  | 'battle-royale'
  | 'time-trial'
  | 'points-classification'
  | 'heats'
  | 'stages'
  | 'pools'
  | 'conference'
  | 'split'
  | 'grand-final'
  | 'bo1'
  | 'bo3'
  | 'bo5'
  | 'bo7'
  | 'home-away'
  | 'aggregate-score'
  | 'olympic'
  | 'fifa'
  | 'atp'
  | 'davis-cup'
  | 'nba'
  | 'worlds'
  | 'champions-league'
  | 'world-cup'
  | 'ufc'
  | 'crossfit'

export type SportFeature =
  | 'playoffs'
  | 'groups'
  | 'homeAway'
  | 'series'
  | 'sets'
  | 'rounds'
  | 'heats'
  | 'clock'
  | 'ranking'
  | 'classification'
  | 'overtime'
  | 'tieBreakers'
  | 'aggregate'
  | 'bracket'
  | 'conference'
  | 'grand-final'

export type ScoreUnit =
  | 'goals'
  | 'points'
  | 'runs'
  | 'sets'
  | 'games'
  | 'rounds'
  | 'time'
  | 'distance'
  | 'strokes'
  | 'pins'
  | 'judges'
  | 'placement'
  | 'maps'
  | 'reps'
  | 'weight'

export interface CompetitionFormatDefinition {
  slug: CompetitionFormatSlug
  name: string
  description: string
  minParticipants: number
  recommendedParticipants?: string
  supportedParticipantTypes: ParticipantType[]
  features: SportFeature[]
  defaultFixture: 'roundRobin' | 'bracket' | 'groupsPlayoffs' | 'heats' | 'classification' | 'series' | 'manual'
  bestOf?: 1 | 3 | 5 | 7
}

export interface SportScoringConfig {
  unit: ScoreUnit
  win: number
  draw?: number
  loss: number
  bye?: number
  allowsDraw: boolean
  overtime: 'none' | 'optional' | 'required'
  tieBreakers: string[]
}

export interface SportMatchStructure {
  playersPerSide?: number
  rosterMin?: number
  rosterMax?: number
  periods?: number
  periodLabel?: string
  periodMinutes?: number
  sets?: number
  gamesPerSet?: number
  rounds?: number
  roundMinutes?: number
  legs?: number
  maps?: number
  holes?: number
  attempts?: number
  heatSize?: number
}

export interface SportMetric {
  key: string
  label: string
  type: 'number' | 'duration' | 'percentage' | 'boolean' | 'text'
  scope: 'participant' | 'team' | 'match' | 'event'
}

export interface SportRuleField {
  key: string
  label: string
  type: 'number' | 'boolean' | 'select' | 'text'
  defaultValue: string | number | boolean
  options?: string[]
  min?: number
  max?: number
}

export interface SportStandingConfig {
  columns: string[]
  sort: string[]
  supportsRanking: boolean
  supportsClassification: boolean
}

export interface SportUiConfig {
  primaryScoreLabel: string
  participantLabel: string
  matchLabel: string
  tableLabel: string
  fixtureLabel: string
}

export interface SportDefinition {
  name: string
  slug: string
  type: ParticipantType[]
  participantCount: {
    min: number
    max?: number
    default: number
    label: string
  }
  validFormats: CompetitionFormatSlug[]
  scoring: SportScoringConfig
  matchStructure: SportMatchStructure
  metrics: SportMetric[]
  ruleFields: SportRuleField[]
  standings: SportStandingConfig
  ui: SportUiConfig
  supports: Record<SportFeature, boolean>
  presets: Array<{
    slug: string
    name: string
    formatSlug: CompetitionFormatSlug
    rules: Record<string, string | number | boolean>
  }>
}

export interface TournamentConfigurationDraft {
  sportSlug: string
  formatSlug: CompetitionFormatSlug
  presetSlug?: string
  rules: Record<string, string | number | boolean>
  customRules?: Record<string, string | number | boolean>
}

export interface TournamentConfigurationResult {
  sport: SportDefinition
  format: CompetitionFormatDefinition
  rulesConfig: Record<string, unknown>
  scoringConfig: SportScoringConfig
  standingsConfig: SportStandingConfig
  fixtureConfig: {
    generator: CompetitionFormatDefinition['defaultFixture']
    features: SportFeature[]
    preview: string[]
  }
  statisticsConfig: {
    metrics: SportMetric[]
  }
  uiConfig: SportUiConfig
  incompatibilities: string[]
}
