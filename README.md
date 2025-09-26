# NGX BioAge Calculator Pro

Lead magnet hecho con Next.js (App Router), shadcn/ui y tema NGX neon (#6D00FF).

- Calculadora de edad biológica (función pura en lib/bioage.ts)
- UI accesible con shadcn/ui, Tailwind v4 y tema oscuro premium
- Gating de resultados con captura de correo (API Route /api/lead)
- Analytics con @vercel/analytics

## Desarrollo

```bash
npm install
npm run dev
```

Abrir http://localhost:3000/bioage-calculator

## Entorno (opcional Firestore)

Ver `.env.local.example` para variables de Firebase Admin.
