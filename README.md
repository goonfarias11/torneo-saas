# 🏆 Torneo SaaS - Gestión de Torneos Deportivos

Plataforma SaaS multi-tenant para gestionar torneos deportivos con arquitectura moderna.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js (Auth.js v5)
- **Componentes UI**: Radix UI + shadcn/ui
- **Deploy**: Optimizado para Vercel

## 📋 Características Principales

### ✅ Multi-Tenant (Multi-Organización)
- Cada organización tiene sus propios torneos, equipos y datos completamente aislados
- Un usuario puede pertenecer a múltiples organizaciones con diferentes roles
- Aislamiento a nivel de base de datos mediante `organizationId`

### 👥 Sistema de Usuarios y Roles
- **OWNER**: Control total de la organización
- **ADMIN**: Gestión de torneos y equipos
- **EDITOR**: Edición de resultados y datos

### 🏟️ Gestión de Torneos
- Tipos de torneo: Liga (round-robin) - Base para futuras expansiones
- Estados: `DRAFT`, `UPCOMING`, `ACTIVE`, `FINISHED`
- Configuración de reglas de puntaje (3-1-0 por defecto, personalizable)

### 👕 Gestión de Equipos
- CRUD completo de equipos
- Relación many-to-many con torneos
- Información básica: nombre, nombre corto, descripción

### 📅 Sistema de Fixtures
- **Generación automática** de partidos (algoritmo round-robin)
- Organización por fechas/rondas
- Carga y edición de resultados en tiempo real
- Estados de partido: `SCHEDULED`, `LIVE`, `FINISHED`, `POSTPONED`, `CANCELLED`

### 📊 Tabla de Posiciones
- Cálculo automático en tiempo real
- Ordenamiento por: puntos → diferencia de goles → goles a favor
- Visualización completa: PJ, G, E, P, GF, GC, DIF, PTS

### 💰 Preparado para Monetización
- Estructura de planes: `FREE`, `PRO`, `PREMIUM`
- Listo para implementar límites por plan (torneos, equipos, usuarios)

## 🏗️ Arquitectura y Decisiones Clave

### Patrón de Arquitectura

```
├── src/
│   ├── actions/          # Server Actions (mutaciones)
│   │   ├── organization.ts
│   │   ├── tournament.ts
│   │   ├── team.ts
│   │   ├── match.ts
│   │   └── standings.ts
│   ├── app/              # App Router (Next.js 14)
│   │   ├── api/          # API Routes (NextAuth)
│   │   ├── auth/         # Páginas de autenticación
│   │   ├── dashboard/    # Dashboard del usuario
│   │   ├── org/          # Páginas de organización
│   │   └── tournament/   # Páginas de torneo
│   ├── components/
│   │   └── ui/           # Componentes UI reutilizables
│   ├── lib/
│   │   ├── auth.ts       # Configuración de NextAuth
│   │   ├── prisma.ts     # Cliente de Prisma
│   │   └── utils.ts      # Utilidades
│   └── types/            # Type definitions
└── prisma/
    └── schema.prisma     # Schema de base de datos
```

### Decisiones Técnicas Importantes

#### 1. **Multi-Tenant por Row-Level**
- Cada modelo principal tiene `organizationId`
- No se usa schemas separados (más simple para MVP)
- Todas las queries filtran automáticamente por organización

#### 2. **Server Components por Defecto**
- La mayoría de las páginas son Server Components
- Client Components solo donde es necesario:
  - `FixtureGenerator` (interacción del usuario)
  - `MatchResultForm` (formularios dinámicos)
  - `TeamSelector` (selección interactiva)

#### 3. **Server Actions para Mutaciones**
- No hay API Routes tradicionales (excepto NextAuth)
- Todas las mutaciones son Server Actions
- Validación en el servidor
- Revalidación automática de paths con `revalidatePath`

#### 4. **Autenticación Simplificada (MVP)**
- NextAuth con provider Credentials
- Auto-creación de usuarios para facilitar demo
- **IMPORTANTE**: En producción, implementar:
  - Hash de passwords (bcrypt)
  - OAuth providers (Google, GitHub)
  - Verificación de email

#### 5. **Prisma Schema Normalizado**
```prisma
// Ejemplo de relación multi-tenant
model Tournament {
  id             String
  organizationId String  // ← Aislamiento
  
  organization   Organization
  participants   TournamentTeam[]
  matches        Match[]
}
```

#### 6. **Algoritmo de Fixtures**
- Round-robin simple: todos contra todos
- Generación de rondas automáticas
- Extensible a otros formatos (eliminación directa, grupos)

#### 7. **Cálculo de Rankings**
- Calculado on-demand (no persistido)
- Performance: O(n) donde n = número de partidos
- Para grandes volúmenes, considerar caché

## 🚀 Instalación y Uso

### 1. Clonar y configurar

```bash
cd torneo
cp .env.example .env
```

### 2. Configurar base de datos

Editar `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/torneo_dev?schema=public"
AUTH_SECRET="genera-uno-con: openssl rand -base64 32"
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Push schema (para desarrollo rápido)
npm run db:push

# O usar migraciones (para producción)
npm run db:migrate
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📖 Flujo de Uso

### Primer Uso
1. Acceder a la app e ingresar con un email
2. Crear una organización
3. Crear equipos
4. Crear un torneo
5. Agregar equipos al torneo
6. Generar fixture automáticamente
7. Cargar resultados
8. Ver tabla de posiciones actualizada en tiempo real

## 🗄️ Modelo de Datos

### Entidades Principales

- **Organization**: Tenant principal
- **OrganizationUser**: Relación user-org con rol
- **Tournament**: Torneo (pertenece a org)
- **Team**: Equipo (pertenece a org)
- **TournamentTeam**: Relación many-to-many
- **Round**: Fecha/jornada
- **Match**: Partido individual

### Relaciones Clave

```
Organization 1---N Tournament
Organization 1---N Team
Tournament N---N Team (via TournamentTeam)
Tournament 1---N Round
Round 1---N Match
Team 1---N Match (homeTeam, awayTeam)
```

## 🎯 Próximos Pasos / Roadmap

### Corto Plazo
- [ ] Implementar hash de passwords
- [ ] OAuth providers (Google, GitHub)
- [ ] Edición de torneos y equipos
- [ ] Eliminación de recursos
- [ ] Validación de permisos más granular

### Mediano Plazo
- [ ] Torneos de eliminación directa
- [ ] Fase de grupos + eliminación
- [ ] Estadísticas por jugador
- [ ] Carga masiva de datos
- [ ] Exportar a PDF/Excel

### Largo Plazo
- [ ] Sistema de pago (Stripe)
- [ ] Límites por plan
- [ ] Webhooks para integraciones
- [ ] API pública
- [ ] App móvil

## 🔐 Seguridad

### Implementado
- Middleware de autenticación
- Validación de acceso a organizaciones
- Aislamiento de datos por tenant
- Server Actions con validación

### Pendiente (Producción)
- Rate limiting
- CSRF protection avanzado
- Sanitización de inputs
- Logging de auditoría
- Backup automático

## 📦 Deploy a Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configurar variables de entorno en Vercel Dashboard
# - DATABASE_URL (Postgres de Vercel/Supabase/Neon)
# - AUTH_SECRET
# - AUTH_URL
```

### Base de Datos en Producción
Opciones recomendadas:
- **Vercel Postgres** (integración nativa)
- **Supabase** (generoso free tier)
- **Neon** (serverless Postgres)
- **Railway** (simple y económico)

## 🧪 Testing (Futuro)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 📝 Notas Técnicas

### Performance
- Server Components = menos JavaScript en cliente
- Prisma queries optimizadas con `include`
- Índices en campos frecuentes (`organizationId`, `status`)

### Escalabilidad
- Arquitectura lista para separar en microservicios
- Queries optimizadas para pagination futura
- Schema preparado para sharding horizontal

### Mantenibilidad
- TypeScript estricto
- Separación clara de concerns
- Server Actions colocados junto a su dominio
- Componentes reutilizables

## 🤝 Contribuir

Para desarrollo local:

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

---

**Desarrollado con** Next.js 14, TypeScript, Tailwind CSS y Prisma
