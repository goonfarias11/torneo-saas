# 🏗️ Arquitectura del Sistema

## Visión General

Torneo SaaS es una aplicación multi-tenant construida siguiendo los principios de arquitectura limpia y patrones modernos de Next.js 14.

## Capas de Arquitectura

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                  │
│  (Server Components, Client Components, UI)     │
├─────────────────────────────────────────────────┤
│              APPLICATION LAYER                   │
│         (Server Actions, Route Handlers)         │
├─────────────────────────────────────────────────┤
│               DOMAIN LAYER                       │
│    (Business Logic, Fixture Generation, etc)    │
├─────────────────────────────────────────────────┤
│           DATA ACCESS LAYER                      │
│         (Prisma Client, Database)                │
└─────────────────────────────────────────────────┘
```

## Decisiones de Arquitectura (ADR)

### ADR-001: Server Components por Defecto

**Contexto**: Next.js 14 App Router favorece Server Components.

**Decisión**: Usar Server Components como patrón por defecto, Client Components solo cuando sea necesario.

**Consecuencias**:
- ✅ Menos JavaScript en cliente
- ✅ Mejor SEO
- ✅ Acceso directo a base de datos
- ❌ Requiere pensar en boundaries cliente/servidor

### ADR-002: Server Actions para Mutaciones

**Contexto**: Necesitamos una forma type-safe de manejar mutaciones.

**Decisión**: Usar Server Actions en lugar de API Routes tradicionales.

**Consecuencias**:
- ✅ Type safety completo
- ✅ Menos boilerplate
- ✅ Revalidación integrada
- ❌ No hay endpoints HTTP tradicionales (puede ser limitante para integraciones externas)

### ADR-003: Multi-Tenant por Row-Level

**Contexto**: Necesitamos aislamiento de datos entre organizaciones.

**Decisión**: Implementar multi-tenancy a nivel de filas con `organizationId` en cada tabla.

**Alternativas consideradas**:
- Schema por tenant (demasiado complejo)
- Base de datos por tenant (no escalable)

**Consecuencias**:
- ✅ Simple de implementar
- ✅ Un solo schema
- ✅ Queries eficientes con índices
- ❌ Requiere disciplina para SIEMPRE filtrar por organizationId

### ADR-004: NextAuth con Credentials

**Contexto**: MVP requiere autenticación rápida.

**Decisión**: Usar NextAuth con provider Credentials simplificado.

**Consecuencias**:
- ✅ Rápido de implementar
- ✅ Extensible a OAuth
- ❌ No es seguro en producción sin hash de passwords
- 📝 TODO: Implementar bcrypt y OAuth antes de producción

### ADR-005: Cálculo On-Demand de Rankings

**Contexto**: Los rankings cambian con cada resultado.

**Decisión**: Calcular rankings on-demand en lugar de persistirlos.

**Alternativas consideradas**:
- Persistir en tabla `Standings` (más complejo, posible desincronización)
- Caché en Redis (overhead para MVP)

**Consecuencias**:
- ✅ Siempre actualizado
- ✅ No hay riesgo de desincronización
- ❌ Recalcula en cada request (O(n) donde n = partidos)
- 📝 Considerar caché si performance es problema

## Patrones de Diseño Utilizados

### 1. Repository Pattern (Implícito)

Los Server Actions actúan como repositorios:

```typescript
// actions/tournament.ts
export async function getTournamentById(id: string) {
  // Validación de acceso
  // Query a DB
  // Retorno de datos
}
```

### 2. Service Layer

Server Actions también encapsulan lógica de negocio:

```typescript
// actions/match.ts
export async function generateFixtures(tournamentId: string) {
  // 1. Validar
  // 2. Obtener equipos
  // 3. Generar combinaciones (algoritmo)
  // 4. Persistir
  // 5. Revalidar
}
```

### 3. Optimistic Updates (Client Components)

```typescript
const [isPending, startTransition] = useTransition()

function handleAction() {
  startTransition(async () => {
    await serverAction()
  })
}
```

## Flujo de Datos

### Lectura (Server Component)

```
Request → Server Component → Server Action (get*) → Prisma → DB
                                                           ↓
Response ← Render ← Return Data ←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### Escritura (Client Component)

```
User Action → Client Component → Server Action → Prisma → DB
                                                         ↓
                                  Revalidate Path ←←←←←←←
                                       ↓
                      Re-render Page ← Next.js Cache Invalidation
```

## Seguridad Multi-Tenant

### Isolation Strategy

```typescript
// Patrón de acceso seguro
async function getResource(resourceId: string) {
  const session = await auth()
  
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { organization: true }
  })
  
  // Verificar membresía
  const membership = await prisma.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: resource.organizationId
      }
    }
  })
  
  if (!membership) throw new Error('Access denied')
  
  return resource
}
```

## Performance Optimizations

### Database Indexes

```prisma
model Tournament {
  @@index([organizationId])
  @@index([status])
}

model Match {
  @@index([tournamentId])
  @@index([status])
}
```

### Query Optimization

```typescript
// ✅ Bueno: Incluir relaciones necesarias
const tournament = await prisma.tournament.findUnique({
  where: { id },
  include: {
    participants: {
      include: { team: true }
    },
    rounds: {
      include: {
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    }
  }
})

// ❌ Malo: N+1 queries
const tournament = await prisma.tournament.findUnique({ where: { id } })
const participants = await prisma.tournamentTeam.findMany({
  where: { tournamentId: id }
})
// ... más queries
```

## Extensibilidad

### Agregar Nuevo Tipo de Torneo

1. Agregar enum en `schema.prisma`:
```prisma
enum TournamentType {
  LEAGUE
  KNOCKOUT // ← Nuevo
}
```

2. Implementar generador de fixtures:
```typescript
// actions/match.ts
export async function generateFixtures(tournamentId: string) {
  const tournament = await getTournament(tournamentId)
  
  switch (tournament.type) {
    case 'LEAGUE':
      return generateRoundRobinFixtures(tournament)
    case 'KNOCKOUT':
      return generateKnockoutFixtures(tournament) // ← Nuevo
  }
}
```

### Agregar Nuevo Rol

1. Enum:
```prisma
enum OrganizationRole {
  OWNER
  ADMIN
  EDITOR
  VIEWER // ← Nuevo
}
```

2. Middleware de permisos:
```typescript
function requireRole(minRole: OrganizationRole) {
  // Implementar lógica
}
```

## Testing Strategy (Futuro)

```
Unit Tests → Server Actions (lógica de negocio)
Integration Tests → Flujos completos con DB test
E2E Tests → User journeys críticos
```

## Deployment Architecture

```
Vercel Edge Network
        ↓
Next.js App (Vercel Functions)
        ↓
PostgreSQL (Vercel Postgres / Supabase)
```

## Monitoring (Producción)

- **Logs**: Vercel Logs / Axiom
- **Errors**: Sentry
- **Analytics**: Vercel Analytics
- **Database**: Prisma Studio / pgAdmin

---

**Última actualización**: Enero 2026
