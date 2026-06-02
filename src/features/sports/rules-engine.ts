import { z } from 'zod'
import { COMPETITION_FORMATS, getFormatBySlug, getSportBySlug } from './catalog'
import type {
  CompetitionFormatSlug,
  SportDefinition,
  SportRuleField,
  TournamentConfigurationDraft,
  TournamentConfigurationResult,
} from './types'

export const tournamentConfigurationSchema = z.object({
  sportSlug: z.string().min(1, 'Selecciona un deporte'),
  formatSlug: z.string().min(1, 'Selecciona un formato'),
  presetSlug: z.string().optional(),
  rules: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
  customRules: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
})

function coerceRuleValue(field: SportRuleField, value: unknown) {
  if (value === undefined || value === null || value === '') return field.defaultValue
  if (field.type === 'boolean') return value === true || value === 'true' || value === 'on'
  if (field.type === 'number') {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return field.defaultValue
    if (field.min !== undefined && parsed < field.min) return field.min
    if (field.max !== undefined && parsed > field.max) return field.max
    return parsed
  }
  return String(value)
}

function buildRules(sport: SportDefinition, draft: TournamentConfigurationDraft) {
  const preset = sport.presets.find((item) => item.slug === draft.presetSlug)
  const mergedRules = {
    ...(preset?.rules ?? {}),
    ...draft.rules,
    ...(draft.customRules ?? {}),
  }

  return sport.ruleFields.reduce<Record<string, string | number | boolean>>((acc, field) => {
    acc[field.key] = coerceRuleValue(field, mergedRules[field.key])
    return acc
  }, {})
}

export function validateTournamentConfiguration(input: unknown): TournamentConfigurationResult {
  const draft = tournamentConfigurationSchema.parse(input)
  const formatSlug = draft.formatSlug as CompetitionFormatSlug
  const sport = getSportBySlug(draft.sportSlug)
  if (!sport) {
    throw new Error('El deporte seleccionado no existe en el catálogo')
  }

  const format = getFormatBySlug(formatSlug)
  if (!format) {
    throw new Error('El formato seleccionado no existe en el catálogo')
  }

  const incompatibilities: string[] = []
  if (!sport.validFormats.includes(format.slug)) {
    incompatibilities.push(`${format.name} no está habilitado para ${sport.name}`)
  }

  const participantTypeCompatible = sport.type.some((type) => format.supportedParticipantTypes.includes(type))
  if (!participantTypeCompatible) {
    incompatibilities.push(`${format.name} no soporta el tipo de participante de ${sport.name}`)
  }

  for (const feature of format.features) {
    if (!sport.supports[feature]) {
      incompatibilities.push(`${sport.name} no soporta la capacidad requerida: ${feature}`)
    }
  }

  if (incompatibilities.length > 0) {
    throw new Error(incompatibilities.join('. '))
  }

  const rulesConfig = {
    ...buildRules(sport, { ...draft, formatSlug }),
    participantCount: sport.participantCount,
    matchStructure: sport.matchStructure,
    features: sport.supports,
  }

  return {
    sport,
    format,
    rulesConfig,
    scoringConfig: sport.scoring,
    standingsConfig: sport.standings,
    fixtureConfig: {
      generator: format.defaultFixture,
      features: format.features,
      preview: buildFixturePreview(format.slug, sport.name),
    },
    statisticsConfig: {
      metrics: sport.metrics,
    },
    uiConfig: sport.ui,
    incompatibilities,
  }
}

export function buildFixturePreview(formatSlug: CompetitionFormatSlug, sportName: string) {
  const format = COMPETITION_FORMATS[formatSlug]

  switch (format.defaultFixture) {
    case 'roundRobin':
      return [
        `Genera fechas todos contra todos para ${sportName}.`,
        formatSlug === 'home-away' ? 'Duplica cruces para ida y vuelta.' : 'Balancea localías cuando aplica.',
        'Ordena tabla con los tie-breakers del deporte.',
      ]
    case 'groupsPlayoffs':
      return [
        'Crea grupos o pools clasificatorios.',
        'Clasifica según cupos y criterios configurados.',
        'Construye bracket final con seeds.',
      ]
    case 'bracket':
      return [
        'Construye llaves por seeds o sorteo.',
        formatSlug === 'double-elimination' ? 'Incluye winners bracket, losers bracket y gran final.' : 'El perdedor queda eliminado.',
        'Permite definir series cuando el deporte lo soporta.',
      ]
    case 'heats':
      return [
        'Distribuye participantes en heats.',
        'Clasifica por posición, marca o mejores tiempos.',
        'Genera semifinales/finales si corresponde.',
      ]
    case 'classification':
      return [
        'Crea eventos de clasificación.',
        'Ordena por tiempo, puntos, marca o colocación.',
        'Permite acumulado por etapas.',
      ]
    case 'series':
      return [
        `Configura series ${format.bestOf ? `BO${format.bestOf}` : 'personalizadas'}.`,
        'Registra parciales y ganador de serie.',
        'Se integra con bracket o playoffs.',
      ]
    default:
      return [
        'Fixture manual o generado por reglas específicas.',
        'El adapter del deporte define la lógica exacta.',
      ]
  }
}

export function parseRulesFromForm(formData: FormData, sport: SportDefinition) {
  return sport.ruleFields.reduce<Record<string, string | number | boolean>>((acc, field) => {
    acc[field.key] = coerceRuleValue(field, formData.get(`rule.${field.key}`))
    return acc
  }, {})
}
