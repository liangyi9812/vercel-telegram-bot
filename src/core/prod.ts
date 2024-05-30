import { VercelRequest, VercelResponse } from "@vercel/node"
import createDebug from "debug"
import { Context, Telegraf } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import { ENVIRONMENT } from "./bot"
import { EnvironmentEnum } from "../types/enum"

const log = createDebug("bot:prod")

const TELEGRAM_SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN
const PORT = parseInt(process.env.PORT || "3000")
// auto set by vercel
const VERCEL_URL = process.env.VERCEL_URL
const VERCEL_REGION = process.env.VERCEL_REGION
const TELEGRAM_WEBHOOK_SUFFIX = "/api/telegram"

const isPord = ENVIRONMENT === EnvironmentEnum.PRODUCTION
const prod = async (
  req: VercelRequest,
  res: VercelResponse,
  bot: Telegraf<Context<Update>>
) => {
  log("Bot runs in prod mode, region: " + VERCEL_REGION)
  if (!VERCEL_URL || !TELEGRAM_SECRET_TOKEN) {
    throw new Error("VERCEL_URL or TELEGRAM_SECRET_TOKEN can't be null at prod")
  }
  const webhookInfo = await bot.telegram.getWebhookInfo()
  const newWebhookUrl = VERCEL_URL + TELEGRAM_WEBHOOK_SUFFIX
  if (!webhookInfo.url || webhookInfo.url !== newWebhookUrl) {
    log("setting new webhook endpoint: " + newWebhookUrl)
    await bot.telegram.setWebhook(newWebhookUrl)
  }

  log(`starting webhook on port: ${PORT}`)
  if (req.method === "POST") {
    await bot.handleUpdate(req.body as unknown as Update, res)
  } else {
    res.status(200).json("Listening to bot events...")
  }
}

const beforeHandle = (
  req: VercelRequest,
  res: VercelResponse,
  next: () => any
) => {
  const token = req.headers["x-telegram-bot-api-secret-token"]
  if (!token || token !== TELEGRAM_SECRET_TOKEN) {
    res.statusCode = 401 // Unauthorized
    res.setHeader("Content-Type", "text/html")
    res.end("<h1>Unauthorized</h1><p>Invalid or missing secret token</p>")
    return
  }

  try {
    next()
  } catch (e: any) {
    console.error(e.message || e)
    res.statusCode = 500
    res.setHeader("Content-Type", "text/html")
    res.end("<h1>Server Error</h1><p>Sorry, there was a problem</p>")
  }
}
export { prod, isPord, beforeHandle }
