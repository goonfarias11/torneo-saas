'use server'

import prisma from '@/lib/prisma'

export async function trackUsage(organizationId: string, metricKey: string, amount = 1) {
  const now = new Date()
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  return prisma.usageRecord.upsert({
    where: { organizationId_metricKey_periodStart: { organizationId, metricKey, periodStart: currentPeriodStart } },
    update: { usage: { increment: amount }, updatedAt: now },
    create: {
      organizationId,
      metricKey,
      periodStart: currentPeriodStart,
      periodEnd: currentPeriodEnd,
      usage: amount,
      updatedAt: now,
    },
  })
}

export async function getUsageForMetric(organizationId: string, metricKey: string, periodStart: Date) {
  return prisma.usageRecord.findFirst({
    where: { organizationId, metricKey, periodStart },
  })
}

export async function getMonthlyUsage(organizationId: string) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  return prisma.usageRecord.findMany({
    where: { organizationId, periodStart: start, periodEnd: end },
  })
}
