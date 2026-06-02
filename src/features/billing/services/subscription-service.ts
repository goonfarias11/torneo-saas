import prisma from '@/lib/prisma'
import { BillingProvider, FeatureKey, Interval, PlanSlug, PlanDefinition, SubscriptionStatus } from '../types'
import { PLANS, getPlanDefinition } from '../plans'

export interface CreateSubscriptionPayload {
  organizationId: string
  planSlug: PlanSlug
  provider: BillingProvider
  providerCustomerId: string
  interval: Interval
  trialDays?: number
}

export async function getAvailablePlans() {
  return Object.values(PLANS) as PlanDefinition[]
}

export async function getSubscriptionForOrganization(organizationId: string) {
  return prisma.subscription.findFirst({
    where: { organizationId, status: { not: SubscriptionStatus.CANCELED } },
    include: { plan: true, addons: true },
  })
}

function parseJsonStringArray(value: string | null | undefined): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function createSubscription(payload: CreateSubscriptionPayload) {
  const plan = getPlanDefinition(payload.planSlug)
  const planRecord = await prisma.subscriptionPlan.findUnique({ where: { slug: payload.planSlug } })

  if (!planRecord) {
    throw new Error(`Plan no encontrado: ${payload.planSlug}`)
  }

  const amount = payload.interval === Interval.ANNUAL ? plan.priceAnnual : plan.priceMonthly

  const subscription = await prisma.subscription.create({
    data: {
      organizationId: payload.organizationId,
      planId: planRecord.id,
      status: SubscriptionStatus.ACTIVE,
      provider: payload.provider,
      providerSubscriptionId: `${payload.provider}-${payload.organizationId}-${Date.now()}`,
      interval: payload.interval,
      trialEndsAt: payload.trialDays ? new Date(Date.now() + payload.trialDays * 86400000) : null,
      currentPeriodStart: new Date(),
      currentPeriodEnd:
        payload.interval === Interval.MONTHLY ? new Date(Date.now() + 30 * 86400000) : new Date(Date.now() + 365 * 86400000),
      amount,
      currency: 'ARS',
    },
  })

  return subscription
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd,
      canceledAt: new Date(),
    },
  })
}

export async function upgradeSubscription(subscriptionId: string, planSlug: PlanSlug) {
  const plan = getPlanDefinition(planSlug)
  const planRecord = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } })

  if (!planRecord) {
    throw new Error(`Plan no encontrado: ${planSlug}`)
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      planId: planRecord.id,
      amount: plan.priceMonthly,
      updatedAt: new Date(),
    },
  })
}

export async function attachAddon(subscriptionId: string, addOnId: string, quantity = 1) {
  return prisma.subscriptionAddon.upsert({
    where: { subscriptionId_addonId: { subscriptionId, addonId: addOnId } },
    update: { quantity },
    create: { subscriptionId, addonId: addOnId, quantity },
  })
}

export async function getFeaturesForSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true, addons: { include: { addon: true } } },
  })

  if (!subscription) return []

  const planFeatures = parseJsonStringArray(subscription.plan?.features)
  const addonFeatures = subscription.addons.flatMap((item) => parseJsonStringArray(item.addon.features))

  return Array.from(new Set(planFeatures.concat(addonFeatures)))
}
