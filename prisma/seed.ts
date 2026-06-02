import { PrismaClient } from '@prisma/client'
import { SPORTS } from '../src/features/sports/catalog'
import { validateTournamentConfiguration } from '../src/features/sports/rules-engine'
import { PLANS, AVAILABLE_FEATURES } from '../src/features/billing/plans'
import { FeatureKey } from '../src/features/billing/types'

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
      users: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  })

  console.log('✅ Organización creada:', org.name)

  await seedBillingData(org.id, org.name, user.email)

  async function seedBillingData(organizationId: string, organizationName: string, ownerEmail: string) {
    for (const plan of Object.values(PLANS)) {
      await prisma.subscriptionPlan.upsert({
        where: { slug: plan.slug },
        update: {
          name: plan.name,
          description: plan.description,
          currency: 'ARS',
          interval: 'MONTHLY',
          amount: plan.priceMonthly,
          isFree: plan.isFree,
          isEnterprise: plan.isEnterprise,
          features: JSON.stringify(plan.features),
          limits: JSON.stringify(plan.limits),
        },
        create: {
          slug: plan.slug,
          name: plan.name,
          description: plan.description,
          currency: 'ARS',
          interval: 'MONTHLY',
          amount: plan.priceMonthly,
          isFree: plan.isFree,
          isEnterprise: plan.isEnterprise,
          features: JSON.stringify(plan.features),
          limits: JSON.stringify(plan.limits),
        },
      })
    }

    for (const [key, label] of Object.entries(AVAILABLE_FEATURES)) {
      await prisma.feature.upsert({
        where: { key },
        update: {
          name: label,
          description: `Habilita ${label} en tu cuenta`,
          isPremium: false,
          isEnterprise: false,
        },
        create: {
          key,
          name: label,
          description: `Habilita ${label} en tu cuenta`,
          isPremium: false,
          isEnterprise: false,
        },
      })
    }

    const addons = [
      {
        slug: 'PREMIUM_STATS',
        name: 'Estadísticas Premium',
        description: 'Añade estadísticas avanzadas y paneles de rendimiento mejorados.',
        amount: 649,
        interval: 'MONTHLY',
        features: JSON.stringify([FeatureKey.ADVANCED_STATS]),
      },
      {
        slug: 'CUSTOM_DOMAIN',
        name: 'Dominio personalizado',
        description: 'Permite conectar un dominio propio a tu liga.',
        amount: 899,
        interval: 'MONTHLY',
        features: JSON.stringify([FeatureKey.CUSTOM_DOMAIN]),
      },
      {
        slug: 'WHITE_LABEL',
        name: 'White label',
        description: 'Elimina la marca TORNEO y personaliza el branding.',
        amount: 1290,
        interval: 'MONTHLY',
        features: JSON.stringify([FeatureKey.WHITE_LABEL]),
      },
      {
        slug: 'API_ADVANCED',
        name: 'API avanzada',
        description: 'Acceso extendido a la API y límites de llamadas superiores.',
        amount: 799,
        interval: 'MONTHLY',
        features: JSON.stringify([FeatureKey.API_ACCESS]),
      },
    ]

    for (const addon of addons) {
      await prisma.addon.upsert({
        where: { slug: addon.slug },
        update: {
          name: addon.name,
          description: addon.description,
          amount: addon.amount,
          interval: addon.interval,
          features: addon.features,
        },
        create: {
          slug: addon.slug,
          name: addon.name,
          description: addon.description,
          amount: addon.amount,
          currency: 'ARS',
          interval: addon.interval,
          features: addon.features,
        },
      })
    }

    const freePlan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'free' } })
    if (freePlan) {
      let subscription = await prisma.subscription.findFirst({
        where: { providerSubscriptionId: `STRIPE-${organizationId}-free-demo` },
      })

      if (!subscription) {
        subscription = await prisma.subscription.create({
          data: {
            organizationId,
            planId: freePlan.id,
            status: 'ACTIVE',
            provider: 'STRIPE',
            providerSubscriptionId: `STRIPE-${organizationId}-free-demo`,
            interval: 'MONTHLY',
            amount: freePlan.amount,
            currency: 'ARS',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
          },
        })
      } else {
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            interval: 'MONTHLY',
            amount: freePlan.amount,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
          },
        })
      }

      await prisma.organizationSubscription.upsert({
        where: { organizationId_subscriptionId: { organizationId, subscriptionId: subscription.id } },
        update: { isPrimary: true },
        create: {
          organizationId,
          subscriptionId: subscription.id,
          isPrimary: true,
        },
      })
    }

    await prisma.billingCustomer.upsert({
      where: { organizationId },
      update: {
        provider: 'STRIPE',
        providerCustomerId: `STRIPE-${organizationId}`,
        email: ownerEmail,
        name: organizationName,
      },
      create: {
        organizationId,
        provider: 'STRIPE',
        providerCustomerId: `STRIPE-${organizationId}`,
        email: ownerEmail,
        name: organizationName,
      },
    })
  }

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

  const demoConfiguration = validateTournamentConfiguration({
    sportSlug: 'football',
    formatSlug: 'champions-league',
    rules: {},
  })

  // Crear torneo
  const tournament = await prisma.tournament.create({
    data: {
      organizationId: org.id,
      name: 'Champions League 2026',
      description: 'Torneo de ejemplo con fixture completo',
      type: 'CHAMPIONS_LEAGUE',
      sportSlug: 'football',
      formatSlug: 'champions-league',
      participantMode: 'TEAM',
      competitionMode: 'CHAMPIONS_LEAGUE',
      status: 'DRAFT',
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      rulesConfig: JSON.stringify(demoConfiguration.rulesConfig),
      scoringConfig: JSON.stringify(demoConfiguration.scoringConfig),
      standingsConfig: JSON.stringify(demoConfiguration.standingsConfig),
      fixtureConfig: JSON.stringify(demoConfiguration.fixtureConfig),
      statisticsConfig: JSON.stringify(demoConfiguration.statisticsConfig),
      uiConfig: JSON.stringify(demoConfiguration.uiConfig),
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

  await prisma.tournamentTemplate.deleteMany({ where: { isSystem: true } })

  for (const sport of SPORTS) {
    for (const preset of sport.presets) {
      try {
        const configuration = validateTournamentConfiguration({
          sportSlug: sport.slug,
          formatSlug: preset.formatSlug,
          presetSlug: preset.slug,
          rules: preset.rules,
        })

        await prisma.tournamentTemplate.create({
          data: {
            name: preset.name,
            description: `${sport.name} - ${configuration.format.name}`,
            sportSlug: sport.slug,
            formatSlug: preset.formatSlug,
            participantMode: sport.type[0].toUpperCase(),
            rulesConfig: JSON.stringify(configuration.rulesConfig),
            scoringConfig: JSON.stringify(configuration.scoringConfig),
            standingsConfig: JSON.stringify(configuration.standingsConfig),
            fixtureConfig: JSON.stringify(configuration.fixtureConfig),
            statisticsConfig: JSON.stringify(configuration.statisticsConfig),
            isSystem: true,
          },
        })
      } catch (error) {
        console.warn(`⚠️ Omitiendo plantilla ${preset.name} de ${sport.name}:`, error instanceof Error ? error.message : error)
      }
    }
  }

  console.log('✅ Plantillas deportivas del sistema creadas')

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
