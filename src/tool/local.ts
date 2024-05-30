import { bot } from "../core"

;(async () => {
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'bot.telegram.edison21.tk'
  const secretToken = process.env.TELEGRAM_SECRET_TOKEN
  if (!domain || !secretToken) {
    throw new Error("[webhook url] or [secretToken] is empty, please check enviroment")
  }
  const webhookUrl = `https://${domain}/api/ahook`
  const res = await bot.telegram.setWebhook(webhookUrl, { secret_token: secretToken })
  if (!res) {
    throw new Error("webhook url set failure, please check log")
  }
  console.log("webhook设置成功, url: " + webhookUrl)
})()
