import { NextResponse } from "next/server"

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || "",
      payload: process.env.FARCASTER_PAYLOAD || "",
      signature: process.env.FARCASTER_SIGNATURE || "",
    },
    frame: {
      version: "1",
      name: "Project Sensei",
      iconUrl: `${process.env.NEXT_PUBLIC_URL}/icon-192x192.png`,
      homeUrl: process.env.NEXT_PUBLIC_URL || "",
      imageUrl: `${process.env.NEXT_PUBLIC_URL}/og-image.png`,
      buttonTitle: "Launch Sensei",
      splashImageUrl: `${process.env.NEXT_PUBLIC_URL}/splash.png`,
      splashBackgroundColor: "#FF6B35",
      webhookUrl: `${process.env.NEXT_PUBLIC_URL}/api/webhook`,
    },
  }

  return NextResponse.json(manifest)
}
