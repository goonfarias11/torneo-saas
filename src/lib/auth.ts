import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"

/**
 * NextAuth solo maneja la sesión JWT.
 * La lógica de login/registro/bcrypt vive en src/actions/auth.ts,
 * donde podemos devolver errores tipados sin depender de NextAuth.
 */
const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // En este punto la contraseña ya fue verificada en la action.
        // Solo buscamos el usuario para devolver sus datos a la sesión.
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim()
        if (!email) return null

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) return null
          return { id: user.id, email: user.email, name: user.name }
        } catch {
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }: any) {
      if (user) token.sub = user.id
      return token
    },
  },
  session: {
    strategy: "jwt" as const,
  },
}

// @ts-ignore - NextAuth v5 beta types
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
