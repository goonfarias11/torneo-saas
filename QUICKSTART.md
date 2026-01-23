# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a tener la aplicación corriendo en 5 minutos.

## Prerequisitos

- Node.js 18+ instalado
- PostgreSQL instalado localmente O cuenta en servicio cloud (Supabase/Neon)
- Git

## Paso 1: Configurar Base de Datos

### Opción A: PostgreSQL Local

```bash
# Si tienes PostgreSQL instalado
createdb torneo_dev
```

### Opción B: Supabase (Gratis)

1. Ir a [supabase.com](https://supabase.com)
2. Crear cuenta y nuevo proyecto
3. Copiar la connection string desde Settings → Database

### Opción C: Neon (Gratis)

1. Ir a [neon.tech](https://neon.tech)
2. Crear cuenta y nuevo proyecto
3. Copiar la connection string

## Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tu editor favorito
# Reemplazar los valores:
```

```env
# Tu connection string de PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/torneo_dev?schema=public"

# Generar secret (ejecutar en terminal):
# openssl rand -base64 32
AUTH_SECRET="tu_secret_generado_aqui"

AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Paso 3: Instalar y Configurar

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npm run db:generate

# Aplicar schema a la base de datos
npm run db:push

# (Opcional) Cargar datos de ejemplo
npm run db:seed
```

## Paso 4: Ejecutar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Paso 5: Usar la Aplicación

### Si ejecutaste el seed:

1. Ir a [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)
2. Ingresar email: `demo@torneo.com`
3. ¡Listo! Verás la organización "Liga Demo" con datos de ejemplo

### Si NO ejecutaste el seed:

1. Ir a [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)
2. Ingresar cualquier email (ej: `tu@email.com`)
3. Crear una nueva organización
4. Crear equipos
5. Crear un torneo
6. Agregar equipos al torneo
7. Generar fixture
8. Cargar resultados
9. Ver tabla de posiciones

## 🔍 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Ejecutar en modo desarrollo

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Aplicar cambios al schema
npm run db:migrate       # Crear migración
npm run db:studio        # Abrir Prisma Studio (GUI)
npm run db:seed          # Cargar datos de ejemplo

# Producción
npm run build            # Build para producción
npm run start            # Ejecutar en producción
```

## 🎨 Prisma Studio

Para explorar la base de datos visualmente:

```bash
npm run db:studio
```

Se abrirá en [http://localhost:5555](http://localhost:5555)

## 🐛 Problemas Comunes

### Error: "Can't reach database server"

**Solución**: Verificar que PostgreSQL esté corriendo y la connection string sea correcta.

```bash
# Verificar estado de PostgreSQL (Linux/Mac)
sudo service postgresql status

# Iniciar PostgreSQL (Linux/Mac)
sudo service postgresql start

# Windows (en Services)
# Buscar "PostgreSQL" y verificar que esté corriendo
```

### Error: "AUTH_SECRET is not defined"

**Solución**: Generar y configurar AUTH_SECRET en `.env`

```bash
openssl rand -base64 32
```

### Prisma no genera tipos correctamente

**Solución**: Re-generar cliente

```bash
npm run db:generate
```

### Puerto 3000 ya en uso

**Solución**: Cambiar puerto

```bash
PORT=3001 npm run dev
```

## 📚 Siguientes Pasos

- Leer [README.md](README.md) para features completas
- Leer [ARCHITECTURE.md](ARCHITECTURE.md) para entender la arquitectura
- Explorar el código en `src/`
- Modificar el schema en `prisma/schema.prisma`

## 🆘 Ayuda

Si tienes problemas:
1. Revisar los logs de la terminal
2. Verificar que todos los prerequisitos estén instalados
3. Verificar que las variables de entorno estén configuradas
4. Abrir un issue en GitHub

---

¡Listo para crear torneos! 🏆
