'use server'

import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { signIn } from "@/lib/auth"

type AuthResult =
  | { ok: true }
  | { ok: false; error: 'campos_vacios' | 'password_corta' | 'password_incorrecta' | 'db_error' }

export async function loginOrRegister(formData: FormData): Promise<AuthResult> {
  const email    = (formData.get("email")    as string | null)?.toLowerCase().trim()
  const password = (formData.get("password") as string | null)?.trim()

  if (!email || !password) {
    return { ok: false, error: 'campos_vacios' }
  }

  if (password.length < 6) {
    return { ok: false, error: 'password_corta' }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      // Usuario existente — verificar contraseña
      if (!existingUser.password) {
        return { ok: false, error: 'password_incorrecta' }
      }
      const ok = await bcrypt.compare(password, existingUser.password)
      if (!ok) {
        return { ok: false, error: 'password_incorrecta' }
      }
    } else {
      // Primer login — crear cuenta
      const hashed = await bcrypt.hash(password, 10)
      await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          password: hashed,
        },
      })
    }

    // Credenciales correctas (o cuenta recién creada) — hacer sign in
    await signIn("credentials", { email, password, redirectTo: "/dashboard" })
    return { ok: true }

  } catch (error: any) {
    // signIn lanza NEXT_REDIRECT cuando redirige — dejar pasar
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error
    console.error("Auth error:", error)
    return { ok: false, error: 'db_error' }
  }
}
