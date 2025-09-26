"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { HelpTip } from "@/components/ui/help-tip"
import { NeonCard } from "@/components/neon-card"
import { StepperInput } from "@/components/stepper-input"
import { calculateBioAge, type BioAgeInput, type BioAgeResult } from "@/lib/bioage"
import { z } from "zod"
import { Loader2, Sparkles, Activity, HeartPulse, Gauge, Zap, Check } from "lucide-react"
import { track } from "@vercel/analytics"

const emailSchema = z.string().email()

type Section = 1 | 2 | 3 | 4 | 5

export default function BioAgeCalculatorPage() {
  const totalSections = 4
  const [section, setSection] = useState<Section>(1)
  const progress = (section / totalSections) * 100

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<(BioAgeResult & BioAgeInput) | null>(null)
  const [email, setEmail] = useState("")
  const [unlocked, setUnlocked] = useState(false)

  // Input mode & auto-calc
  const [mode, setMode] = useState<"form" | "sliders" | "quick">("form")


  // Inputs state
  const [chronoAge, setChronoAge] = useState<number | "">("")
  const [sex, setSex] = useState<"male" | "female" | "">("")
  const [height, setHeight] = useState<number | "">("")
  const [weight, setWeight] = useState<number | "">("")

  const [sleepHours, setSleepHours] = useState<number | "">("")
  const [sleepQuality, setSleepQuality] = useState<"excellent" | "good" | "fair" | "poor" | "">("")
  const [hrv, setHrv] = useState<number | "">("")

  const [vo2max, setVo2max] = useState<number | "">("")
  const [gripStrength, setGripStrength] = useState<number | "">("")
  const [walkSpeed, setWalkSpeed] = useState<number | "">("")

  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "light" | "moderate" | "active" | "veryActive" | ""
  >("")
  const [stressLevel, setStressLevel] = useState<"low" | "moderate" | "high" | "veryHigh" | "">("")
  const [dietQuality, setDietQuality] = useState<"excellent" | "good" | "fair" | "poor" | "">("")


  const isSection1Valid = chronoAge !== "" && height !== "" && weight !== "" && sex !== ""
  const isSection2Valid = sleepHours !== "" && sleepQuality !== ""
  const isSection3Valid = true // optional fields
  const isSection4Valid = activityLevel !== "" && stressLevel !== "" && dietQuality !== ""

  function goTo(next: Section) {
    setSection(next)
  }

  function onModeChange(v: string) {
    setMode(v as any)
    try { track("input_mode_selected", { mode: v }) } catch {}
  }

  function toNumber<T extends number | "">(v: T): number {
    return (v as any) === "" ? 0 : Number(v)
  }

  async function onCalculate() {
    if (!(isSection1Valid && isSection2Valid && isSection4Valid)) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    try { track("calc_clicked") } catch {}
    setLoading(true)
    setTimeout(() => {
      const payload: BioAgeInput = {
        chronoAge: Number(chronoAge),
        sex: (sex || "male") as any,
        height: Number(height),
        weight: Number(weight),
        sleepHours: Number(sleepHours),
        sleepQuality: sleepQuality as any,
        hrv: toNumber(hrv),
        vo2max: toNumber(vo2max),
        gripStrength: toNumber(gripStrength),
        walkSpeed: toNumber(walkSpeed),
        activityLevel: activityLevel as any,
        stressLevel: stressLevel as any,
        dietQuality: dietQuality as any,
      }

      const r = calculateBioAge(payload)
      setResults({ ...r, ...payload })
      setSection(5)
      setLoading(false)
    }, 1000)
  }

  async function unlockWithEmail() {
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) {
      alert("Ingresa un email válido para desbloquear")
      return
    }

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "bioage-calculator", utm: getUtm() }),
      })
      setUnlocked(true)
      try { track("lead_unlocked", { source: "bioage-calculator" }) } catch {}
    } catch (e) {
      console.error(e)
      setUnlocked(true) // fallback unlock
    }
  }

  function getUtm() {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
    const all: Record<string, string> = {}
    keys.forEach((k) => {
      const v = params.get(k)
      if (v) all[k] = v
    })
    return all
  }

  // Presets rápidos (modo "Rápido")
  function applyPreset(name: "activo" | "sedentario" | "sueno" | "dieta") {
    if (name === "activo") {
      setActivityLevel("active"); setVo2max(45); setWalkSpeed(1.3); setGripStrength(35); setSleepHours(7.5); setSleepQuality("good"); setStressLevel("moderate"); setDietQuality("good")
    } else if (name === "sedentario") {
      setActivityLevel("sedentary"); setVo2max(28); setWalkSpeed(0.9); setGripStrength(22); setSleepHours(6); setSleepQuality("fair"); setStressLevel("high"); setDietQuality("fair")
    } else if (name === "sueno") {
      setSleepHours(8); setSleepQuality("excellent"); setStressLevel("low")
    } else if (name === "dieta") {
      setDietQuality("excellent")
    }
  }

  const ageDiff = useMemo(() => {
    if (!results) return 0
    return results.bioAge - results.chronoAge
  }, [results])

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl">
        <CardContent className="p-6 sm:p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl border border-[var(--primary)] flex items-center justify-center shadow-[var(--neon-shadow-soft)]">
              <Sparkles className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div className="text-2xl font-extrabold bg-gradient-to-br from-[var(--primary)] to-[var(--primary-glow)] bg-clip-text text-transparent tracking-tight">
              NGX BioAge Calculator Pro
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-1">Descubre tu edad biológica real con precisión científica</div>
          </div>

          {/* Mode + Auto-calc + Progress */}
          <div className="mb-4 flex items-center justify-center">
            <Tabs value={mode} onValueChange={onModeChange}>
              <TabsList>
                <TabsTrigger value="form">Formulario</TabsTrigger>
                <TabsTrigger value="sliders">Sliders</TabsTrigger>
                <TabsTrigger value="quick">Rápido</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {section <= 4 && (
            <div className="mb-8">
              <div className="h-1.5 w-full rounded-full bg-[#1a1a1a] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6D00FF, #8F33FF)", boxShadow: "0 0 20px rgba(109,0,255,0.6)" }} />
              </div>
            </div>
          )}

          {/* Sections */}
          {section === 1 && (
            <div>
              <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Información Básica</h1>
              <p className="text-center text-sm text-[var(--text-muted)] mb-8">Comencemos con algunos datos fundamentales para personalizar tu análisis</p>

              <div className="space-y-6">

                <div className="space-y-2">
                  <Label htmlFor="chronoAge" className="flex items-center gap-2">Edad Cronológica <HelpTip content="Tu edad en años cumplidos." /></Label>
                  {mode === "form" && (
                    <Input id="chronoAge" type="number" inputMode="numeric" placeholder="Ej: 45" min={18} max={100} value={chronoAge} onChange={(e) => setChronoAge(e.target.value === "" ? "" : Number(e.target.value))} />
                  )}
                  {mode === "sliders" && (
                    <div className="px-1">
                      <Slider min={18} max={100} value={[Number(chronoAge || 18)]} onValueChange={(v) => setChronoAge(v[0])} />
                    </div>
                  )}
                  {mode === "quick" && (
                    <StepperInput id="chronoAge" value={chronoAge} onChange={setChronoAge} min={18} max={100} />
                  )}
                  <p className="text-xs text-[var(--text-muted)]">Tu edad actual en años</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Sexo Biológico <HelpTip content="Usado para ajustar VO2max y fuerza esperada." /></Label>
                  <RadioGroup value={sex} onValueChange={(v) => setSex(v as any)} className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <RadioGroupItem id="male" value="male" className="peer sr-only" />
                      <Label htmlFor="male" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 text-center hover:border-primary/40 peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                        Masculino
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="female" value="female" className="peer sr-only" />
                      <Label htmlFor="female" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 text-center hover:border-primary/40 peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                        Femenino
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2">Altura (cm) <HelpTip content="Usada para calcular el IMC." /></Label>
                    {mode === "form" && (
                    <Input id="height" type="number" inputMode="numeric" placeholder="Ej: 175" min={140} max={220} value={height} onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))} />
                    )}
                    {mode === "sliders" && (
                      <div className="px-1">
                        <Slider min={140} max={220} value={[Number(height || 140)]} onValueChange={(v) => setHeight(v[0])} />
                      </div>
                    )}
                    {mode === "quick" && (
                      <StepperInput id="height" value={height} onChange={setHeight} min={140} max={220} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">Peso (kg) <HelpTip content="Usado para calcular el IMC." /></Label>
                    {mode === "form" && (
                    <Input id="weight" type="number" inputMode="numeric" placeholder="Ej: 70" min={40} max={200} value={weight} onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))} />
                    )}
                    {mode === "sliders" && (
                      <div className="px-1">
                        <Slider min={40} max={200} value={[Number(weight || 40)]} onValueChange={(v) => setWeight(v[0])} />
                      </div>
                    )}
                    {mode === "quick" && (
                      <StepperInput id="weight" value={weight} onChange={setWeight} min={40} max={200} />
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="neon" size="lg" onClick={() => goTo(1)} disabled>
                    Atrás
                  </Button>
                  <Button variant="neon" size="lg" onClick={() => goTo(2)} disabled={!isSection1Valid}>
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {section === 2 && (
            <div>
              <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Sueño y Recuperación</h1>
              <p className="text-center text-sm text-[var(--text-muted)] mb-8">El sueño es fundamental para tu edad biológica</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sleepHours" className="flex items-center gap-2">Horas de Sueño Promedio <HelpTip content="Promedio de las últimas 4 semanas." /></Label>
                  {mode === "form" && (
                    <Input id="sleepHours" type="number" inputMode="decimal" step="0.5" min={4} max={12} placeholder="Ej: 7.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value === "" ? "" : Number(e.target.value))} />
                  )}
                  {mode === "sliders" && (
                    <div className="px-1">
                      <Slider min={4} max={12} value={[Number(sleepHours || 4)]} onValueChange={(v) => setSleepHours(v[0])} />
                    </div>
                  )}
                  {mode === "quick" && (
                    <StepperInput id="sleepHours" value={sleepHours} onChange={setSleepHours} min={4} max={12} />
                  )}
                  <p className="text-xs text-[var(--text-muted)]">Promedio de las últimas 4 semanas</p>
                </div>

                <div className="space-y-2">
                  <Label>Calidad del Sueño</Label>
                  <RadioGroup value={sleepQuality} onValueChange={(v) => setSleepQuality(v as any)} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-2" aria-label="Calidad del Sueño">
                    <div>
                      <RadioGroupItem id="sleep-excellent" value="excellent" className="peer sr-only" />
                      <Label htmlFor="sleep-excellent" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Excelente
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="sleep-good" value="good" className="peer sr-only" />
                      <Label htmlFor="sleep-good" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Bueno
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="sleep-fair" value="fair" className="peer sr-only" />
                      <Label htmlFor="sleep-fair" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Regular
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="sleep-poor" value="poor" className="peer sr-only" />
                      <Label htmlFor="sleep-poor" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Pobre
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hrv" className="flex items-center gap-2">Variabilidad Cardíaca (HRV) <HelpTip content="Promedio en ms; mayor HRV suele asociarse a mejor recuperación." /></Label>
                  {mode === "form" && (
                    <Input id="hrv" type="number" inputMode="numeric" placeholder="Ej: 45" min={10} max={150} value={hrv} onChange={(e) => setHrv(e.target.value === "" ? "" : Number(e.target.value))} />
                  )}
                  {mode === "sliders" && (
                    <div className="px-1">
                      <Slider min={10} max={150} value={[Number(hrv || 10)]} onValueChange={(v) => setHrv(v[0])} />
                    </div>
                  )}
                  {mode === "quick" && (
                    <StepperInput id="hrv" value={hrv} onChange={setHrv} min={10} max={150} />
                  )}
                  <p className="text-xs text-[var(--text-muted)]">Promedio en ms (si lo conoces)</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="neon" size="lg" onClick={() => goTo(1)}>
                    Atrás
                  </Button>
                  <Button variant="neon" size="lg" onClick={() => goTo(3)} disabled={!isSection2Valid}>
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {section === 3 && (
            <div>
              <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Rendimiento Físico</h1>
              <p className="text-center text-sm text-[var(--text-muted)] mb-8">Métricas clave de tu capacidad física</p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vo2" className="flex items-center gap-2">VO2 Max Estimado <HelpTip content="ml/kg/min — indicador de fitness cardiorrespiratorio." /></Label>
                    {mode === "form" && (
                      <Input id="vo2" type="number" inputMode="numeric" placeholder="Ej: 42" min={15} max={80} value={vo2max} onChange={(e) => setVo2max(e.target.value === "" ? "" : Number(e.target.value))} />
                    )}
                    {mode === "sliders" && (
                      <div className="px-1">
                        <Slider min={15} max={80} value={[Number(vo2max || 15)]} onValueChange={(v) => setVo2max(v[0])} />
                      </div>
                    )}
                    {mode === "quick" && (
                      <StepperInput id="vo2" value={vo2max} onChange={setVo2max} min={15} max={80} />
                    )}
                    <p className="text-xs text-[var(--text-muted)]">ml/kg/min - Puedes estimarlo con una prueba de caminata</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grip" className="flex items-center gap-2">Fuerza de Agarre (kg) <HelpTip content="Indicador funcional asociado a longevidad." /></Label>
                    {mode === "form" && (
                      <Input id="grip" type="number" inputMode="numeric" placeholder="Ej: 35" min={10} max={100} value={gripStrength} onChange={(e) => setGripStrength(e.target.value === "" ? "" : Number(e.target.value))} />
                    )}
                    {mode === "sliders" && (
                      <div className="px-1">
                        <Slider min={10} max={100} value={[Number(gripStrength || 10)]} onValueChange={(v) => setGripStrength(v[0])} />
                      </div>
                    )}
                    {mode === "quick" && (
                      <StepperInput id="grip" value={gripStrength} onChange={setGripStrength} min={10} max={100} />
                    )}
                    <p className="text-xs text-[var(--text-muted)]">Mano dominante - Indicador clave de longevidad</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walk" className="flex items-center gap-2">Velocidad de Caminata (m/s) <HelpTip content="Tiempo promedio al caminar 4 m a paso normal." /></Label>
                  {mode === "form" && (
                    <Input id="walk" type="number" inputMode="decimal" step="0.1" min={0.5} max={2.5} placeholder="Ej: 1.2" value={walkSpeed} onChange={(e) => setWalkSpeed(e.target.value === "" ? "" : Number(e.target.value))} />
                  )}
                  {mode === "sliders" && (
                    <div className="px-1">
                      <Slider min={0.5} max={2.5} value={[Number(walkSpeed || 0.5)]} onValueChange={(v) => setWalkSpeed(v[0])} />
                    </div>
                  )}
                  {mode === "quick" && (
                    <StepperInput id="walk" value={walkSpeed} onChange={setWalkSpeed} min={0.5 as any} max={2.5 as any} step={0.1 as any} />
                  )}
                  <p className="text-xs text-[var(--text-muted)]">Velocidad normal caminando 4 metros</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="neon" size="lg" onClick={() => goTo(2)}>
                    Atrás
                  </Button>
                  <Button variant="neon" size="lg" onClick={() => goTo(4)}>
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {section === 4 && (
            <div>
              <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Estilo de Vida</h1>
              <p className="text-center text-sm text-[var(--text-muted)] mb-8">Factores de lifestyle que impactan tu edad biológica</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Nivel de Actividad Física <HelpTip content="Frecuencia semanal aproximada de ejercicio." /></Label>
                  <p className="text-xs text-[var(--text-muted)]">Selecciona el nivel que mejor te represente la mayoría de semanas.</p>
                  <RadioGroup value={activityLevel} onValueChange={(v) => setActivityLevel(v as any)} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-1" aria-label="Nivel de Actividad Física">
                    <div>
                      <RadioGroupItem id="activity-sedentary" value="sedentary" className="peer sr-only" />
                      <Label htmlFor="activity-sedentary" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Sedentario
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="activity-light" value="light" className="peer sr-only" />
                      <Label htmlFor="activity-light" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Ligero
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="activity-moderate" value="moderate" className="peer sr-only" />
                      <Label htmlFor="activity-moderate" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Moderado
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="activity-active" value="active" className="peer sr-only" />
                      <Label htmlFor="activity-active" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Activo
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="activity-veryActive" value="veryActive" className="peer sr-only" />
                      <Label htmlFor="activity-veryActive" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Muy Activo
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Nivel de Estrés Percibido <HelpTip content="Cómo te sientes la mayor parte del tiempo." /></Label>
                  <RadioGroup value={stressLevel} onValueChange={(v) => setStressLevel(v as any)} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-1" aria-label="Nivel de Estrés Percibido">
                    <div>
                      <RadioGroupItem id="stress-low" value="low" className="peer sr-only" />
                      <Label htmlFor="stress-low" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Bajo
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="stress-moderate" value="moderate" className="peer sr-only" />
                      <Label htmlFor="stress-moderate" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Moderado
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="stress-high" value="high" className="peer sr-only" />
                      <Label htmlFor="stress-high" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Alto
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="stress-veryHigh" value="veryHigh" className="peer sr-only" />
                      <Label htmlFor="stress-veryHigh" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Muy Alto
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Calidad de la Dieta <HelpTip content="Cuánta comida real vs. ultraprocesada consumes." /></Label>
                  <RadioGroup value={dietQuality} onValueChange={(v) => setDietQuality(v as any)} className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-1" aria-label="Calidad de la Dieta">
                    <div>
                      <RadioGroupItem id="diet-excellent" value="excellent" className="peer sr-only" />
                      <Label htmlFor="diet-excellent" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Excelente
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="diet-good" value="good" className="peer sr-only" />
                      <Label htmlFor="diet-good" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Buena
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="diet-fair" value="fair" className="peer sr-only" />
                      <Label htmlFor="diet-fair" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Regular
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem id="diet-poor" value="poor" className="peer sr-only" />
                      <Label htmlFor="diet-poor" className="block cursor-pointer rounded-xl border bg-secondary/60 px-4 py-3 pl-8 text-center hover:border-primary/40 transition-colors min-h-[44px] relative peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-[0_0_20px_rgba(109,0,255,0.25)] peer-data-[state=checked]:bg-[linear-gradient(135deg,rgba(109,0,255,0.25),rgba(143,51,255,0.25))]">
                        <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100 text-[var(--primary)]" aria-hidden="true" />
                        Pobre
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="neon" size="lg" onClick={() => goTo(3)}>
                    Atrás
                  </Button>
                  <Button variant="neon" size="lg" onClick={onCalculate} disabled={loading || !isSection4Valid}>
                    {loading ? (
                      <>
                        Calculando <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      "Calcular Edad Biológica"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {section === 5 && results && (
            <div className="text-center">
              <div className="mb-8">
                <div className="mx-auto mb-6 h-16 w-16 flex items-center justify-center">
                  <Gauge className="h-14 w-14 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Tu Análisis BioAge NGX</h1>
              </div>

              <NeonCard className="p-8 mb-8">
                <div className="uppercase text-xs tracking-widest text-[var(--text-muted)] mb-2">Tu Edad Biológica Real</div>
                <div className="text-7xl sm:text-8xl font-extrabold bg-gradient-to-b from-white to-neutral-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.25)] animate-neon-pulse">
                  {results.bioAge}
                </div>
                <div className="mt-2 text-lg font-medium">
                  {ageDiff < -2 && (
                    <span className="text-emerald-400">¡{Math.abs(ageDiff)} años más joven que tu edad cronológica!</span>
                  )}
                  {ageDiff >= -2 && ageDiff <= 2 && (
                    <span className="text-amber-400">Cerca de tu edad cronológica ({results.chronoAge} años)</span>
                  )}
                  {ageDiff > 2 && (
                    <span className="text-red-400">{ageDiff} años mayor que tu edad cronológica</span>
                  )}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase border"
                  style={{
                    color: ageDiff < -2 ? "#10B981" : ageDiff <= 2 ? "#F59E0B" : "#EF4444",
                    borderColor: ageDiff < -2 ? "#10B981" : ageDiff <= 2 ? "#F59E0B" : "#EF4444",
                    background:
                      ageDiff < -2
                        ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))"
                        : ageDiff <= 2
                        ? "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))"
                        : "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))",
                  }}
                >
                  {ageDiff < -2 ? "✨ EXCELENTE" : ageDiff <= 2 ? "⚡ BUENO" : "⚠️ ATENCIÓN REQUERIDA"}
                </div>
              </NeonCard>

              {/* Metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                <MetricCard title="Salud Metabólica" value={`${results.metabolicScore}%`} icon={<Activity className="opacity-80" />} />
                <MetricCard title="Fitness Cardiovascular" value={`${results.cardioScore}%`} icon={<HeartPulse className="opacity-80" />} />
                <MetricCard title="Fuerza Funcional" value={`${results.strengthScore}%`} icon={<Zap className="opacity-80" />} />
                <MetricCard title="Recuperación" value={`${results.recoveryScore}%`} icon={<Sparkles className="opacity-80" />} />
              </div>

              {/* Gating */}
              {!unlocked && (
                <NeonCard className="mt-10 p-6 text-left">
                  <h3 className="text-lg font-semibold mb-2">Desbloquea recomendaciones personalizadas y proyección a 5 años</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">Ingresa tu email para recibir tu plan NGX y mejoras sugeridas basadas en tu análisis.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input type="email" placeholder="tu@email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button variant="neon" onClick={unlockWithEmail}>Desbloquear</Button>
                  </div>
                </NeonCard>
              )}

              {/* Recommendations */}
              {unlocked && (
                <>
                  <div className="mt-10 text-left">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5" /> Áreas de Mejora Prioritarias
                    </h3>
                    <div className="space-y-3">
                      {results.metabolicScore < 60 && (
                        <Recommendation priority="ALTA" text="Optimiza tu nutrición con el protocolo NGX SAGE - enfoque en alimentos antiinflamatorios y timing nutricional" />
                      )}
                      {results.cardioScore < 60 && (
                        <Recommendation priority="ALTA" text="Mejora tu VO2 Max con entrenamientos HIIT personalizados NGX BLAZE - 3x/semana, 20 minutos" />
                      )}
                      {results.strengthScore < 60 && (
                        <Recommendation priority="MEDIA" text="Incrementa fuerza funcional con protocolo NGX - enfoque en grip strength y velocidad de marcha" />
                      )}
                      {results.recoveryScore < 60 && (
                        <Recommendation priority="ALTA" text="Optimiza tu recuperación con NGX WAVE - mejora HRV y calidad de sueño profundo" />
                      )}
                    </div>
                  </div>

                  <div className="mt-8 p-6 rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent text-left">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Gauge className="h-5 w-5" /> Proyección a 5 Años
                    </h3>
                    <p className="text-[var(--text-muted)] leading-7">
                      {ageDiff < 0 ? (
                        <>
                          <strong className="text-emerald-400">Escenario Optimista:</strong> Si mantienes tu estilo de vida actual, en 5 años podrías tener una edad biológica de <span className="text-primary font-bold">{results.bioAge + 3}</span> años (vs {results.chronoAge + 5} cronológicos).<br /><br />
                          <strong>Con NGX Premium:</strong> Implementando optimizaciones personalizadas, podrías reducir tu edad biológica adicionales 5-8 años.
                        </>
                      ) : (
                        <>
                          <strong className="text-amber-400">Escenario Actual:</strong> Sin cambios, en 5 años tu edad biológica podría ser <span className="text-red-400 font-bold">{results.bioAge + 7}</span> años.<br /><br />
                          <strong className="text-emerald-400">Con NGX Premium:</strong> Implementando el protocolo personalizado NGX, podrías revertir tu edad biológica hasta <span className="text-primary font-bold">{results.chronoAge - 3}</span> años en los próximos 12 meses.
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3 mt-10">
                <Button variant="neon" size="lg" onClick={() => {
                  // reset
                  setSection(1);
                  setResults(null);
                  setUnlocked(false);
                  setEmail("");
                  setChronoAge(""); setSex(""); setHeight(""); setWeight("");
                  setSleepHours(""); setSleepQuality(""); setHrv("");
                  setVo2max(""); setGripStrength(""); setWalkSpeed("");
                  setActivityLevel(""); setStressLevel(""); setDietQuality("");
                }}>Nuevo Cálculo</Button>
                <Button variant="neon" size="lg" onClick={() => { try { track("premium_cta_click") } catch {}; alert("🚀 Accediendo a NGX Premium - Tu transformación biológica comienza aquí")}}>Acceder a NGX Premium</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <NeonCard className="p-5">
      <div className="absolute inset-x-0 top-0 h-0.5 motion-safe:animate-[scan_3s_linear_infinite] bg-[linear-gradient(90deg,transparent,var(--primary),transparent)]" />
      <div className="mb-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">{title}</div>
      <div className="mb-2 text-3xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">{value}</div>
      <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">{icon}<span>Estado</span></div>
    </NeonCard>
  )
}

function Recommendation({ priority, text }: { priority: string; text: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-secondary p-4">
      <span className="inline-block rounded-md bg-primary/10 text-primary text-[11px] font-semibold tracking-widest px-2 py-1 mb-2">PRIORIDAD {priority}</span>
      <p className="text-[var(--text-muted)]">{text}</p>
    </div>
  )
}
