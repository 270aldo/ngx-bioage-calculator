import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

let db: ReturnType<typeof getFirestore> | null = null

export function getDb() {
  if (db) return db

  try {
    if (!getApps().length) {
      const projectId = process.env.FIREBASE_PROJECT_ID
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
      let privateKey = process.env.FIREBASE_PRIVATE_KEY

      if (!projectId || !clientEmail || !privateKey) {
        console.warn("Firebase env vars not set. Skipping Firestore init.")
        return null
      }

      // Support private keys with or without explicit newlines
      privateKey = privateKey.replace(/\\n/g, "\n")

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    }

    db = getFirestore()
    return db
  } catch (e) {
    console.warn("Failed to init Firestore:", e)
    return null
  }
}
