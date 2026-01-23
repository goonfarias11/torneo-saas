import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'demo@torneo.com' },
    update: {},
    create: {
      email: 'demo@torneo.com',
      name: 'Usuario Demo',
    },
  })

  console.log('✅ Usuario creado:', user.email)

  // Crear organización de prueba
  const org = await prisma.organization.upsert({
    where: { slug: 'liga-demo' },
    update: {},
    create: {
      name: 'Liga Demo',
      slug: 'liga-demo',
      description: 'Organización de ejemplo para probar el sistema',
      plan: 'FREE',
      users: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  })

  console.log('✅ Organización creada:', org.name)

  // Crear equipos
  const teamNames = [
    'Real Madrid',
    'Barcelona',
    'Manchester United',
    'Bayern Munich',
    'Juventus',
    'PSG',
    'Liverpool',
    'Chelsea',
  ]

  const teams = []
  for (const name of teamNames) {
    const team = await prisma.team.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name,
        shortName: name.substring(0, 3).toUpperCase(),
      },
    })
    teams.push(team)
    console.log('✅ Equipo creado:', team.name)
  }

  // Crear torneo
  const tournament = await prisma.tournament.create({
    data: {
      organizationId: org.id,
      name: 'Champions League 2026',
      description: 'Torneo de ejemplo con fixture completo',
      type: 'LEAGUE',
      status: 'DRAFT',
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  })

  console.log('✅ Torneo creado:', tournament.name)

  // Agregar equipos al torneo
  for (const team of teams) {
    await prisma.tournamentTeam.create({
      data: {
        tournamentId: tournament.id,
        teamId: team.id,
      },
    })
  }

  console.log('✅ Equipos agregados al torneo')

  console.log('\n🎉 Seed completado con éxito!')
  console.log('\n📝 Credenciales de acceso:')
  console.log('   Email: demo@torneo.com')
  console.log('   Organización: Liga Demo (liga-demo)')
  console.log('\n🚀 Ejecuta "npm run dev" y accede a http://localhost:3000')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
