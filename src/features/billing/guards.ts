import { PlanDefinition, FeatureKey } from './types'

const UNLIMITED = -1

function isUnlimited(value: number) {
  return value < 0
}

export function canCreateTournament(plan: PlanDefinition, activeTournaments: number) {
  return isUnlimited(plan.limits.activeTournaments) || activeTournaments < plan.limits.activeTournaments
}

export function canAddTeam(plan: PlanDefinition, currentTeams: number) {
  return isUnlimited(plan.limits.teams) || currentTeams < plan.limits.teams
}

export function canAddPlayer(plan: PlanDefinition, currentPlayers: number) {
  return isUnlimited(plan.limits.players) || currentPlayers < plan.limits.players
}

export function canCreateOrganization(plan: PlanDefinition, currentOrganizations: number) {
  return isUnlimited(plan.limits.organizations) || currentOrganizations < plan.limits.organizations
}

export function canUseWhiteLabel(plan: PlanDefinition) {
  return plan.features.includes(FeatureKey.WHITE_LABEL) || plan.limits.whiteLabelSeats > 0
}

export function canUseAdvancedStats(plan: PlanDefinition) {
  return plan.features.includes(FeatureKey.ADVANCED_STATS)
}

export function canUseApiAccess(plan: PlanDefinition) {
  return plan.features.includes(FeatureKey.API_ACCESS)
}

export function canUseCustomDomain(plan: PlanDefinition) {
  return plan.features.includes(FeatureKey.CUSTOM_DOMAIN) && plan.limits.customDomains > 0
}

export function canUseFeature(plan: PlanDefinition, feature: FeatureKey) {
  return plan.features.includes(feature)
}
