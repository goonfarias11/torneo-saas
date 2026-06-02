'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COMPETITION_FORMATS, SPORTS, getFormatsForSport, getSportBySlug } from '@/features/sports/catalog'
import { buildFixturePreview } from '@/features/sports/rules-engine'

interface TournamentCreationWizardProps {
  organizationSlug: string
}

const steps = ['Deporte', 'Formato', 'Reglas', 'Preview', 'Confirmar']

export function TournamentCreationWizard({ organizationSlug }: TournamentCreationWizardProps) {
  const [step, setStep] = useState(0)
  const [sportSlug, setSportSlug] = useState('football')
  const [formatSlug, setFormatSlug] = useState('league')
  const [presetSlug, setPresetSlug] = useState('')

  const sport = getSportBySlug(sportSlug) ?? SPORTS[0]
  const formats = useMemo(() => getFormatsForSport(sportSlug), [sportSlug])
  const selectedFormat = COMPETITION_FORMATS[formatSlug as keyof typeof COMPETITION_FORMATS] ?? formats[0]
  const selectedPreset = sport.presets.find((preset) => preset.slug === presetSlug)
  const preview = selectedFormat ? buildFixturePreview(selectedFormat.slug, sport.name) : []
  const scoring = sport.scoring

  function selectSport(nextSportSlug: string) {
    const nextSport = getSportBySlug(nextSportSlug) ?? SPORTS[0]
    setSportSlug(nextSport.slug)
    setFormatSlug(nextSport.validFormats[0])
    setPresetSlug('')
    setStep(Math.max(step, 1))
  }

  function selectPreset(nextPresetSlug: string) {
    setPresetSlug(nextPresetSlug)
    const preset = sport.presets.find((item) => item.slug === nextPresetSlug)
    if (preset) setFormatSlug(preset.formatSlug)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" placeholder="Ej: Apertura 2026" required minLength={2} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripcion (opcional)</Label>
        <Input id="description" name="description" placeholder="Descripcion breve del torneo" />
      </div>

      <input type="hidden" name="sportSlug" value={sport.slug} />
      <input type="hidden" name="formatSlug" value={selectedFormat.slug} />
      <input type="hidden" name="presetSlug" value={presetSlug} />
      <input type="hidden" name="pointsForWin" value={scoring.win} />
      <input type="hidden" name="pointsForDraw" value={scoring.draw ?? 0} />
      <input type="hidden" name="pointsForLoss" value={scoring.loss} />
      <input type="hidden" name="pointsForBye" value={scoring.bye ?? 0} />

      <div className="grid grid-cols-5 gap-2">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={`rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
              step === index ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">Seleccionar deporte</h2>
            <p className="text-sm text-muted-foreground">El deporte define formatos compatibles, reglas, metricas y standings.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SPORTS.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => selectSport(item.slug)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  item.slug === sport.slug ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <span className="block font-semibold">{item.name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.type.join(', ')} · {item.validFormats.length} formatos
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold">Formato compatible</h2>
            <p className="text-sm text-muted-foreground">Solo se muestran formatos validos para {sport.name}.</p>
          </div>
          {sport.presets.length > 0 && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <Label htmlFor="preset">Preset reutilizable</Label>
              <select
                id="preset"
                value={presetSlug}
                onChange={(event) => selectPreset(event.target.value)}
                className="w-full rounded-md border bg-background p-2 text-sm"
              >
                <option value="">Sin preset</option>
                {sport.presets.map((preset) => (
                  <option key={preset.slug} value={preset.slug}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {formats.map((format) => (
              <button
                key={format.slug}
                type="button"
                onClick={() => setFormatSlug(format.slug)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  format.slug === selectedFormat.slug ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <span className="block font-semibold">{format.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{format.description}</span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  Min. {format.minParticipants} · {format.recommendedParticipants ?? 'flexible'}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">Reglas avanzadas</h2>
            <p className="text-sm text-muted-foreground">Campos generados por el adapter de {sport.name}.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sport.ruleFields.map((field) => {
              const presetValue = selectedPreset?.rules[field.key]
              const defaultValue = presetValue ?? field.defaultValue
              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`rule.${field.key}`}>{field.label}</Label>
                  {field.type === 'select' ? (
                    <select
                      id={`rule.${field.key}`}
                      name={`rule.${field.key}`}
                      defaultValue={String(defaultValue)}
                      className="w-full rounded-md border bg-background p-2 text-sm"
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'boolean' ? (
                    <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
                      <input
                        type="checkbox"
                        name={`rule.${field.key}`}
                        defaultChecked={Boolean(defaultValue)}
                        value="true"
                      />
                      Activo
                    </label>
                  ) : (
                    <Input
                      id={`rule.${field.key}`}
                      name={`rule.${field.key}`}
                      type={field.type === 'number' ? 'number' : 'text'}
                      defaultValue={String(defaultValue)}
                      min={field.min}
                      max={field.max}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Puntuacion</p>
              <p className="font-semibold">
                G {scoring.win} · E {scoring.draw ?? 0} · P {scoring.loss}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unidad</p>
              <p className="font-semibold">{scoring.unit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overtime</p>
              <p className="font-semibold">{scoring.overtime}</p>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">Vista previa del fixture</h2>
            <p className="text-sm text-muted-foreground">Preview generado desde la estrategia {selectedFormat.defaultFixture}.</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{sport.name}</p>
                <p className="text-xl font-black">{selectedFormat.name}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {selectedFormat.defaultFixture}
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {preview.map((item, index) => (
                <div key={item} className="rounded-md border bg-background p-3 text-sm">
                  <span className="font-bold">Paso {index + 1}: </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">Confirmar creacion</h2>
            <p className="text-sm text-muted-foreground">El torneo queda en borrador para cargar participantes antes de generar fixture.</p>
          </div>
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
            <Summary label="Deporte" value={sport.name} />
            <Summary label="Formato" value={selectedFormat.name} />
            <Summary label="Participantes" value={sport.participantCount.label} />
            <Summary label="Match" value={sport.ui.matchLabel} />
            <Summary label="Standings" value={sport.standings.columns.join(' · ')} />
            <Summary label="Metricas" value={sport.metrics.map((metric) => metric.label).slice(0, 4).join(' · ')} />
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
        <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Anterior
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" className="sm:flex-1" onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>
            Continuar
          </Button>
        ) : (
          <Button type="submit" className="sm:flex-1 font-bold">
            Crear torneo
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href={`/org/${organizationSlug}`}>Cancelar</Link>
        </Button>
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value || '-'}</p>
    </div>
  )
}
