'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTeam(organizationId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const name = formData.get('name') as string
  const shortName = formData.get('shortName') as string | null
  const description = formData.get('description') as string | null

  if (!name || name.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres')
  }

  const team = await prisma.team.create({
    data: {
      organizationId,
      name,
      shortName,
      description,
    },
  })

  revalidatePath(`/org/${organizationId}`)
  return { success: true, teamId: team.id }
}

export async function getTeamsByOrganization(organizationId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const teams = await prisma.team.findMany({
    where: {
      organizationId,
    },
    include: {
      _count: {
        select: {
          tournaments: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return teams
}

export async function deleteTeam(teamId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autenticado')
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  })

  if (!team) {
    throw new Error('Equipo no encontrado')
  }

  await prisma.team.delete({
    where: { id: teamId },
  })

  revalidatePath(`/org/${team.organizationId}`)
  return { success: true }
}
