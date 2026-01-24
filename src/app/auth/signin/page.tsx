import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"

export default function SignInPage() {
  async function handleSignIn(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: "demo",
        redirectTo: "/dashboard",
      })
    } catch (error) {
      // Si hay error, redirigir igual para MVP
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-card/50 border-border/50">
        <CardHeader>
          <div className="text-center mb-4">
            <h1 className="text-3xl font-black tracking-tight">
              TORNEO<span className="text-accent">.</span>
            </h1>
          </div>
          <CardTitle className="text-2xl font-black">Iniciar Sesión</CardTitle>
          <CardDescription className="font-medium">
            Ingresa tu email para acceder (MVP simplificado)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignIn}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full font-bold shadow-lg shadow-accent/20">
                Ingresar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
