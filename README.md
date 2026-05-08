# Torneo App

Aplicación web para gestionar torneos deportivos. Simple y funcional.

## Funcionalidades

- 🔐 Autenticación con email + contraseña (bcrypt)
- 🏢 Organizaciones (agrupan torneos y equipos)
- 🏆 Torneos tipo liga (round-robin, todos contra todos)
- 👥 Equipos con alta y baja
- 📅 Fixture automático con algoritmo circle/round-robin correcto
- 📊 Tabla de posiciones en tiempo real
- ✏️ Carga y edición de resultados
- 🔄 Control de estado del torneo (Borrador → En curso → Finalizado)

## Cómo funciona el login

- Ingresás email + contraseña (mínimo 6 caracteres)
- Si es la **primera vez** con ese email → se crea la cuenta automáticamente
- Si ya existe la cuenta → verifica la contraseña con bcrypt
- No hay formulario de registro separado

## Stack

- **Next.js 14** (App Router, Server Actions)
- **Prisma** + **PostgreSQL**
- **NextAuth v5** (JWT, sin adapter)
- **bcryptjs** para contraseñas
- **Tailwind CSS** + shadcn/ui

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Completar DATABASE_URL y NEXTAUTH_SECRET

# 3. Crear tablas en la DB
npx prisma db push

# 4. Iniciar
npm run dev
```

## Variables de entorno

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="un-string-largo-aleatorio"
NEXTAUTH_URL="http://localhost:3000"
```

Generar NEXTAUTH_SECRET: `openssl rand -base64 32`

## Fixture — algoritmo

Se usa el **método circle** (rotación), que garantiza:
- Con N equipos (par): N−1 fechas, N/2 partidos por fecha
- Con N equipos (impar): N fechas, (N−1)/2 partidos por fecha
- Distribución equitativa de locales/visitantes
