import { bot, isDev } from "../core"

;(async () => {
  const domain = process.env.TELEGRAM_WEBHOOK_DOMAIN
  const secretToken = process.env.TELEGRAM_SECRET_TOKEN
  if (!isDev) {
    throw new Error("只能在本地运行, use: yarn setWebhook")
  } else if (!domain || !secretToken) {
    throw new Error("[webhook url] or [secretToken] is empty, please check enviroment")
  }
  const webhookUrl = `https://${domain}/api/ahook`
  const res = await bot.telegram.setWebhook(webhookUrl, { secret_token: secretToken })
  if (!res) {
    throw new Error("webhook url set failure, please check log")
  }
  console.log("设置成功, url: " + webhookUrl)
})()
