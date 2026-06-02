'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function createOrganization(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  if (!name || name.trim().length < 3) throw new Error('El nombre debe tener al menos 3 caracteres')

  const slug = generateSlug(name)

  const existing = await prisma.organization.findUnique({ where: { slug } })
  if (existing) throw new Error('Ya existe una organización con ese nombre')

  const organization = await prisma.organization.create({
    data: {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      users: {
        create: {
          userId: session.user.id,
          role: 'OWNER',
        },
      },
    },
  })

  revalidatePath('/dashboard')
  return { success: true, organizationSlug: organization.slug }
}

export async function getUserOrganizations() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const orgs = await prisma.organizationUser.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
          include: {
            _count: {
              select: { tournaments: true, teams: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return orgs.map((ou) => ({
      ...ou.organization,
      role: ou.role,
      tournamentCount: ou.organization._count.tournaments,
      teamCount: ou.organization._count.teams,
    }))
  } catch (error) {
    console.error('Database error:', error)
    return []
  }
}

export async function deleteOrganization(organizationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  })

  if (!membership || membership.role !== 'OWNER') {
    throw new Error('Solo el propietario puede eliminar la organización')
  }

  await prisma.organization.delete({ where: { id: organizationId } })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getOrganizationBySlug(slug: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      users: {
        where: { userId: session.user.id },
      },
    },
  })

  if (!org || org.users.length === 0) throw new Error('No tienes acceso a esta organización')

  return { ...org, userRole: org.users[0].role }
}
