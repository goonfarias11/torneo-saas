export enum BillingProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  MERCADOPAGO = 'MERCADOPAGO',
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
}

export enum Interval {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export enum FeatureKey {
  BASIC_STATS = 'BASIC_STATS',
  ADVANCED_STATS = 'ADVANCED_STATS',
  PLAYER_PROFILES = 'PLAYER_PROFILES',
  ASSISTS = 'ASSISTS',
  GOALSCORERS = 'GOALSCORERS',
  LIVE_EVENTS = 'LIVE_EVENTS',
  CUSTOM_DOMAIN = 'CUSTOM_DOMAIN',
  WHITE_LABEL = 'WHITE_LABEL',
  API_ACCESS = 'API_ACCESS',
  MULTI_ORG = 'MULTI_ORG',
  MOBILE_APP = 'MOBILE_APP',
  PUBLIC_PAGE = 'PUBLIC_PAGE',
  SEASONS = 'SEASONS',
  HISTORY = 'HISTORY',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
  STREAMING = 'STREAMING',
  ONLINE_REGISTRATION = 'ONLINE_REGISTRATION',
  FINANCE_MANAGEMENT = 'FINANCE_MANAGEMENT',
  MULTI_SPORTS = 'MULTI_SPORTS',
}

export enum LimitUnit {
  ITEMS = 'ITEMS',
  MB = 'MB',
  CALLS = 'CALLS',
}

export interface FeatureDefinition {
  key: FeatureKey
  name: string
  description: string
  isPremium?: boolean
  isEnterprise?: boolean
}

export type PlanSlug = 'free' | 'starter' | 'pro' | 'liga' | 'federacion'

export interface PlanLimits {
  activeTournaments: number
  teams: number
  players: number
  organizations: number
  users: number
  storageMb: number
  apiCallsPerMonth: number
  customDomains: number
  whiteLabelSeats: number
}

export interface PlanDefinition {
  slug: PlanSlug
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  isFree: boolean
  isEnterprise: boolean
  features: FeatureKey[]
  limits: PlanLimits
  defaultAddons: string[]
}

export interface BillingPlanDescriptor {
  id: string
  name: string
  description: string
  currency: string
  interval: Interval
  amount: number
  features: FeatureKey[]
  limits: PlanLimits
}
