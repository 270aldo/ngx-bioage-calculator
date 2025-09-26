import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/firebaseAdmin"

const Payload = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  utm: z.record(z.string(), z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = Payload.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
    }

    const { email, source, utm } = parsed.data

    const db = getDb()
    if (db) {
      await db.collection("leads").add({
        email,
        source: source || "bioage",
        utm: utm || null,
        createdAt: new Date().toISOString(),
      })
    } else {
      console.log("Lead (no Firestore configured):", { email, source, utm })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
