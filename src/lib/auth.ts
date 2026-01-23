import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"

// Para simplificar el MVP, usamos autenticación simple
// En producción, usar Google/GitHub OAuth
const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        // TODO: Implementar validación real con bcrypt
        // Por ahora, para MVP, cualquier email sirve
        if (!credentials?.email) return null
        
        try {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user) {
            // Auto-crear usuario para MVP
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                name: (credentials.email as string).split('@')[0],
              },
            })
          }

          return user
        } catch (error) {
          // Si no hay DB, crear usuario temporal
          return {
            id: "demo-user-id",
            email: credentials.email as string,
            name: (credentials.email as string).split('@')[0],
          }
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
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt" as const,
  },
}

// @ts-ignore - NextAuth v5 beta types
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
