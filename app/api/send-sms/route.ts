import { type NextRequest, NextResponse } from "next/server"

// Use environment variables instead of hardcoded values
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Get SMS recipients from environment variable
const SMS_RECIPIENTS = process.env.ALERT_RECIPIENTS?.split(",") || []

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("Missing Twilio environment variables")
      return NextResponse.json(
        {
          success: false,
          error: "Twilio configuration is missing. Please check environment variables.",
        },
        { status: 500 },
      )
    }

    if (SMS_RECIPIENTS.length === 0) {
      console.error("No SMS recipients configured")
      return NextResponse.json(
        {
          success: false,
          error: "No SMS recipients configured. Please check ALERT_RECIPIENTS environment variable.",
        },
        { status: 500 },
      )
    }

    const { message } = await request.json()

    console.log("Attempting to send SMS...")
    console.log("Message:", message)
    console.log("Recipients count:", SMS_RECIPIENTS.length)

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")

    const results: { to: string; status: "sent" | "skipped"; sid?: string }[] = []

    for (const recipient of SMS_RECIPIENTS) {
      const cleanRecipient = recipient.trim() // Clean any whitespace
      try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: TWILIO_PHONE_NUMBER,
            To: cleanRecipient,
            Body: message,
          }),
        })

        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { code?: number; message?: string } | {}
          if ((err as any).code === 21608) {
            console.warn(`Skipped un-verified number ${cleanRecipient}`)
            results.push({ to: cleanRecipient, status: "skipped" })
            continue
          }
          throw new Error(err.message ?? `Twilio error (${res.status})`)
        }

        const data = (await res.json()) as { sid: string }
        results.push({ to: cleanRecipient, status: "sent", sid: data.sid })
      } catch (e) {
        console.error(`Failed to send SMS to ${cleanRecipient}:`, e)
        results.push({ to: cleanRecipient, status: "skipped" })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error sending SMS:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to send SMS alerts: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
