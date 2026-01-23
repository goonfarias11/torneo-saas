'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { OrganizationRole } from '@prisma/client'

export async function createOrganization(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  if (!name || name.length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres')
  }

  const slug = generateSlug(name)

  try {
    // Verificar que el slug no exista
    const existing = await prisma.organization.findUnique({
      where: { slug },
    })

    if (existing) {
      throw new Error('Ya existe una organización con ese nombre')
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description,
        users: {
          create: {
            userId: session.user.id,
            role: OrganizationRole.OWNER,
          },
        },
      },
    })

    revalidatePath('/dashboard')
    return { success: true, organizationId: organization.id }
  } catch (error: any) {
    if (error.message?.includes('Ya existe')) {
      throw error
    }
    throw new Error('Error de base de datos. Por favor configura la conexión a PostgreSQL en el archivo .env')
  }
}

export async function getUserOrganizations() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    const orgs = await prisma.organizationUser.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                tournaments: true,
                teams: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return orgs.map((ou) => ({
      ...ou.organization,
      role: ou.role,
      tournamentCount: ou.organization._count.tournaments,
      teamCount: ou.organization._count.teams,
    }))
  } catch (error) {
    // Si no hay DB configurada, retornar array vacío
    console.error('Database error:', error)
    return []
  }
}

export async function getOrganizationBySlug(slug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      users: {
        where: {
          userId: session.user.id,
        },
      },
    },
  })

  if (!org || org.users.length === 0) {
    throw new Error('No tienes acceso a esta organización')
  }

  return {
    ...org,
    userRole: org.users[0].role,
  }
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: OrganizationRole
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  // Verificar que el usuario actual es OWNER o ADMIN
  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  })

  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    throw new Error('No tienes permisos para invitar usuarios')
  }

  // Buscar o crear usuario
  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
      },
    })
  }

  // Crear membresía
  await prisma.organizationUser.create({
    data: {
      userId: user.id,
      organizationId,
      role,
    },
  })

  revalidatePath(`/org/[slug]`, 'page')
  return { success: true }
}
