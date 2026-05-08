import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight">
            TORNEO<span className="text-accent">.</span>
          </h1>
          <div className="flex gap-3">
            <Button variant="ghost" asChild className="font-semibold">
              <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
            <Button asChild className="font-bold shadow-lg shadow-accent/20">
              <Link href="/auth/signin">Comenzar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-6 py-24 md:py-32 relative">
            <div className="max-w-5xl">
              <div className="inline-block mb-6">
                <span className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm tracking-wide uppercase">
                  Gestión de Torneos
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                ORGANIZA TUS
                <br />
                <span className="text-accent">TORNEOS</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-foreground/80 font-medium max-w-2xl mb-12 leading-relaxed">
                Creá torneos, equipos, fixtures y tablas de posiciones desde una sola aplicación simple y rápida.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" asChild className="text-lg font-black px-8 py-7 shadow-2xl shadow-accent/30 hover:shadow-accent/40 transition-all">
                  <Link href="/auth/signin">COMENZAR AHORA</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg font-bold px-8 py-7 border-2 hover:bg-accent/5">
                  <Link href="#features">Ver Funcionalidades</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card destacada */}
            <Card className="md:col-span-2 p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 hover:border-accent/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-3 tracking-tight">Gestión Instantánea</h3>
                  <p className="text-foreground/70 text-lg font-medium leading-relaxed">
                    Crea torneos en segundos. Sistema de fixtures automático, tabla de posiciones en tiempo real y resultados actualizados al instante.
                  </p>
                </div>
              </div>
            </Card>

            {/* Card normal */}
            <Card className="p-6 bg-card/50 border-border/50 hover:bg-card hover:border-border transition-all">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Torneos rápidos</h3>
              <p className="text-foreground/60 font-medium">
                Creación simple de torneos sin configuraciones complejas.
              </p>
            </Card>

            {/* Card normal */}
            <Card className="p-6 bg-card/50 border-border/50 hover:bg-card hover:border-border transition-all">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Estadísticas Pro</h3>
              <p className="text-foreground/60 font-medium">
                Tablas de posiciones automáticas con todos los datos de competición.
              </p>
            </Card>

            {/* Card destacada secundaria */}
            <Card className="md:col-span-2 p-8 bg-secondary/50 border-border/50 hover:bg-secondary hover:border-border transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-3 tracking-tight">Control Total</h3>
                  <p className="text-foreground/70 text-lg font-medium leading-relaxed">
                    Administra equipos, partidos y resultados con una interfaz diseñada para velocidad y precisión. Sin complicaciones.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground font-semibold">
            © 2026 <span className="text-accent font-black">TORNEO</span>. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
