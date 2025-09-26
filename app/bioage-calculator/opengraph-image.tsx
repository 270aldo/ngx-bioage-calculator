import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Og() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #000000 100%)",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              border: "2px solid rgba(139,92,246,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 80px rgba(139,92,246,0.35)",
            }}
          >
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L4 14V24C4 35 12 43 24 44C36 43 44 35 44 24V14L24 4Z" stroke="url(#gradient)" strokeWidth="2"/>
              <path d="M24 14V24L32 28" stroke="url(#gradient)" strokeWidth="2"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#A855F7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1
            style={{
              fontSize: 64,
              letterSpacing: -1,
              margin: 0,
              background: "linear-gradient(135deg, #FFFFFF 0%, #BDBDBD 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            NGX BioAge Calculator
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 24, margin: 0 }}>
            Descubre tu edad biológica real
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
