# NGX BioAge Calculator — UI Style & Design Guide (v0.1)

This guide documents the visual system, interaction patterns, accessibility, and implementation details used in NGX BioAge Calculator Pro.

Goals
- Modern, premium dark UI aligned with NGX brand
- High clarity and touch-friendly interactions for mobile
- Accessibility by default (keyboard, screen readers, reduced motion)
- Consistency powered by shadcn/ui components and Tailwind v4

1) Brand & Theme
- Mode: Dark premium
- Primary (Electric Violet): #6D00FF
- Primary Glow: #8F33FF
- Background: #0A0A0A (dark), #000000 (dark mode root)
- Surfaces: Onyx family (#1A1A1A / #2A2A2A)
- Text: #FFFFFF with muted variant rgba(255,255,255,0.6)
- Danger: #EF4444
- Ring: rgba(109,0,255,0.5)
- Neon shadows: var(--neon-shadow), var(--neon-shadow-soft)
- Radii: base 10px (var(--radius)) with xl=+4px

2) Typography
- Display: Josefin Sans (variable --font-josefin)
- Body: Inter (variable --font-inter)
- Loaded via next/font in app/layout.tsx (display: swap)

3) Design Tokens (CSS variables)
Defined in app/globals.css for both :root and .dark.
- Colors: --primary, --primary-glow, --background, --foreground, --secondary, --muted, --text-muted, --accent, --border, --ring
- Charts: --chart-1..--chart-5
- Sidebar: --sidebar-*
- Typography vars: --font-sans, --font-mono
- Radii: --radius, and derived --radius-{sm,md,lg,xl}

4) Layout and Spacing
- Container: max-w-2xl, p-6 (mobile-friendly padding)
- Card: rounded-3xl, border, blur, neon soft shadow
- Grid gaps: 2–6 range per context, maintain generous spacing for touch

5) Components

5.1 Buttons
- Library: components/ui/button.tsx (shadcn base + NGX variant)
- Variants:
  - neon (Primary CTA style):
    - bg-black, text-white, border var(--primary), rounded-full on size=lg
    - Shadow soft by default, amplified on hover, subtle lift (-1px)
  - outline, default, secondary, ghost, link (available as needed)
- Sizes: sm, default, lg, icon
- Guidance:
  - CTAs and navigation (Continuar, Atrás, Nuevo Cálculo, Acceder a NGX Premium) usan variant="neon" y size="lg"
  - Usa focus-visible rings para accesibilidad

5.2 NeonCard
- File: components/neon-card.tsx
- Style: border-2 con var(--primary), bg-black/50, backdrop-blur-xl, shadow neon suave, glow radial sutil con ::before
- Uso: contenedores destacados (resumen de edad biológica, gating, métricas)
- Scan bar: línea superior con motion-safe:animate-[scan_3s_linear_infinite]

5.3 Tooltip / HelpTip (Accesible)
- Files: components/ui/tooltip.tsx, components/ui/help-tip.tsx
- HelpTip: botón enfocable con aria-label + icono HelpCircle, envuelto en Tooltip (Radix) para contenido
- Reglas: triggers siempre enfocables (teclado), contenido conciso, evitar bloqueos en móvil

5.4 Segmented Radio Chips
- Implementación en app/bioage-calculator/page.tsx usando RadioGroupItem + Label (shadcn)
- Estados:
  - Inactivo: bg-secondary/60, borde sutil
  - Activo: gradiente violeta (primary→glow), texto blanco, borde primary, sombra neon, icono Check a la izquierda
  - Focus: ring visible (focus-visible)
- Accesibilidad: RadioGroupItem sr-only, Label como chip, navegación por teclado correcta
- Tamaño táctil: min-h-[44px] (>=44px arriba/abajo), padding confortable

5.5 Inputs y Sliders
- Inputs: usan inputMode="numeric" o "decimal" para teclado móvil correcto; min/max/step apropiados; Labels claros
- Sliders: shadcn slider para alternativas de input (modo "Sliders")
- StepperInput: input rápido con incrementos (modo "Rápido")

5.6 Tabs
- Shadcn Tabs con TabsList/TabsTrigger; centrado superior
- Valores: "Formulario", "Sliders", "Rápido"

5.7 Progreso de pasos
- Barra simple con h-1.5, bg #1a1a1a, relleno con gradiente linear violeta + glow para presencia

6) Motion & Effects
- Neon pulse: clase .animate-neon-pulse para el número grande; animación sutil; desactivada bajo prefers-reduced-motion
- Scan bar: motion-safe para respetar preferencias del usuario
- Transiciones: cortas, sin parpadeos; priorizar easing suave

7) Accesibilidad (A11y)
- Focus visible rings en todos los controles interactivos
- RadioGroup para elecciones (en vez de botones con aria-pressed)
- Tooltip triggers enfocados (HelpTip) y con aria-label
- Contraste: texto blanco sobre fondos oscuros; estado activo con contraste alto
- Reduced motion: desactivar/negar animaciones no críticas cuando el sistema lo indica
- Tap targets: >=44px para móvil
- Labels y descripciones claras (hints de texto en inputs)

8) Móvil
- Viewport configurado en app/layout.tsx (export const viewport)
- Tipografía y spacing ajustados para pantallas pequeñas
- inputMode para teclado adecuado en numéricos/decimales
- touch-manipulation en elementos interactivos

9) Analytics & Conversion
- Eventos (via @vercel/analytics):
  - input_mode_selected, calc_clicked, lead_unlocked, premium_cta_click
- Gating: se solicita email para desbloquear recomendaciones y proyección

10) Theming y Customización
- Tailwind v4 con tokens vinculados a CSS variables en globals.css
- Base shadcn/ui (estilo "new-york") con overrides NGX (neon + dark premium)
- Plugin tailwindcss-animate para utilidades de animación de shadcn

11) Do & Don’t
- Do: unificar todos los CTAs y navegación en variant="neon" size="lg"
- Do: usar RadioGroup chips para selecciones táctiles
- Do: mantener motion-safe y reduced motion en efectos
- Don’t: introducir triggers de tooltip no enfocables
- Don’t: mezclar estilos de botones dentro de un mismo flujo

Referencias de archivos clave
- app/globals.css — tokens, neon-pulse, base
- app/layout.tsx — fuentes, viewport, analytics
- components/ui/button.tsx — variantes (incluye ‘neon’)
- components/neon-card.tsx — card premium con neon
- components/ui/tooltip.tsx y components/ui/help-tip.tsx — tooltips accesibles
- components/ui/radio-group.tsx — grupo base (usado por chips)
- app/bioage-calculator/page.tsx — implementación completa de UX
