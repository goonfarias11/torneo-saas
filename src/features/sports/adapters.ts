import { validateTournamentConfiguration } from './rules-engine'
import type { TournamentConfigurationDraft, TournamentConfigurationResult } from './types'

export interface SportAdapter {
  slug: string
  composeConfiguration(draft: TournamentConfigurationDraft): TournamentConfigurationResult
  canGenerateFixture(configuration: TournamentConfigurationResult): boolean
  getFixtureStrategy(configuration: TournamentConfigurationResult): TournamentConfigurationResult['fixtureConfig']['generator']
}

class CatalogSportAdapter implements SportAdapter {
  constructor(public slug: string) {}

  composeConfiguration(draft: TournamentConfigurationDraft) {
    return validateTournamentConfiguration(draft)
  }

  canGenerateFixture(configuration: TournamentConfigurationResult) {
    return configuration.fixtureConfig.generator !== 'manual'
  }

  getFixtureStrategy(configuration: TournamentConfigurationResult) {
    return configuration.fixtureConfig.generator
  }
}

export function createSportAdapter(sportSlug: string): SportAdapter {
  return new CatalogSportAdapter(sportSlug)
}
