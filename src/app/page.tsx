import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Torneo SaaS</h1>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signin">Comenzar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-2xl px-4">
          <h2 className="text-5xl font-bold tracking-tight">
            Gestiona tus torneos deportivos
          </h2>
          <p className="text-xl text-muted-foreground">
            Plataforma multi-tenant para crear, organizar y administrar torneos deportivos
            de forma simple y profesional.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/auth/signin">Comenzar Gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Ver Características</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Torneo SaaS. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
