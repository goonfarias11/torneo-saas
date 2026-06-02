'use server'

import prisma from '@/lib/prisma'
import { BillingProvider, Interval } from '../types'

export async function createBillingCustomer(organizationId: string, provider: BillingProvider, payload: { email: string; name: string; providerCustomerId: string }) {
  return prisma.billingCustomer.upsert({
    where: { organizationId },
    update: {
      provider: provider,
      providerCustomerId: payload.providerCustomerId,
      email: payload.email,
      name: payload.name,
    },
    create: {
      organizationId,
      provider,
      providerCustomerId: payload.providerCustomerId,
      email: payload.email,
      name: payload.name,
    },
  })
}

export async function createInvoice(payload: {
  organizationId: string
  subscriptionId: string
  providerInvoiceId: string
  amountDue: number
  amountPaid: number
  currency: string
  dueDate: Date
  periodStart: Date
  periodEnd: Date
  status: string
  pdfUrl?: string
}) {
  return prisma.invoice.create({
    data: {
      organizationId: payload.organizationId,
      subscriptionId: payload.subscriptionId,
      providerInvoiceId: payload.providerInvoiceId,
      amountDue: payload.amountDue,
      amountPaid: payload.amountPaid,
      currency: payload.currency,
      dueDate: payload.dueDate,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      status: payload.status,
      pdfUrl: payload.pdfUrl,
    },
  })
}

export async function recordPayment(payload: {
  invoiceId: string
  providerPaymentId: string
  organizationId: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  paidAt: Date
}) {
  return prisma.payment.create({
    data: {
      invoiceId: payload.invoiceId,
      organizationId: payload.organizationId,
      providerPaymentId: payload.providerPaymentId,
      amount: payload.amount,
      currency: payload.currency,
      paymentMethod: payload.paymentMethod,
      status: payload.status,
      paidAt: payload.paidAt,
    },
  })
}

export function resolveProviderCustomerId(provider: BillingProvider, organizationId: string) {
  return `${provider}-${organizationId}`
}

export async function getInvoiceHistory(organizationId: string) {
  return prisma.invoice.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })
}
