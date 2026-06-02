import { createTournament } from "@/actions/tournament"
import { getOrganizationBySlug } from "@/actions/organization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { TournamentCreationWizard } from "./tournament-creation-wizard"

export default async function NewTournamentPage({ params }: { params: { slug: string } }) {
  let org: any
  try {
    org = await getOrganizationBySlug(params.slug)
  } catch {
    notFound()
  }

  async function handleCreate(formData: FormData) {
    'use server'
    const result = await createTournament(org.id, formData)
    if (result.success) {
      redirect(`/tournament/${result.tournamentId}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <Link href={`/org/${params.slug}`} className="text-sm text-accent hover:underline mb-2 block font-bold">
            ← Volver a {org.name}
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Nuevo Torneo</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        <Card className="bg-card/80 border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Crear torneo dinamico</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Configura deporte, formato, reglas avanzadas y preview antes de confirmar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate}>
              <TournamentCreationWizard organizationSlug={params.slug} />
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
