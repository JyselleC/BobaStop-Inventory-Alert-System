// Twilio SMS integration
export interface SMSAlert {
  message: string
  recipients: string[]
}

export async function sendSMSAlert(alert: SMSAlert): Promise<any> {
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alert),
    })

    if (!response.ok) {
      throw new Error("Failed to send SMS")
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending SMS:", error)
    return false
  }
}

export function formatLowStockAlert(lowStockItems: any[]): string {
  if (lowStockItems.length === 1) {
    const item = lowStockItems[0]
    return `Sent from BobaStop Inventory - You're low on ${item.name}! Current quantity: ${item.quantity} from ${item.supplier}.\n\nTime to restock! 🧋`
  }

  const itemCount = lowStockItems.length
  const itemNames = lowStockItems
    .slice(0, 2)
    .map((item) => `${item.name} (${item.quantity} left)`)
    .join(", ")

  let message = `Sent from BobaStop Inventory - You're low on ${itemCount} items!\n\n`
  message += `${itemNames}`

  if (itemCount > 2) {
    message += ` and ${itemCount - 2} more items.`
  }

  message += `\n\nTime to restock! 🧋`

  return message
}
