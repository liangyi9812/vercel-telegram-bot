import { Context, Telegraf } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import createDebug from "debug"
import { EnvironmentEnum } from "../types/enum"
import { ENVIRONMENT } from "./bot"

const log = createDebug("bot:dev")

const isDev = ENVIRONMENT === EnvironmentEnum.DEVELOPMENT
const dev = async (bot: Telegraf<Context<Update>>) => {
  let webhookUrl: string | undefined
  const botInfo = (await bot.telegram.getMe()).username
  log("Bot runs in dev mode")

  bot
    // .launch({ dropPendingUpdates: true })
    .launch()
    .then(() => log(`${botInfo} starting polling`))
    .catch((e) => log("Uh oh, bot didn't start: " + e.msg))
}

export { dev, isDev }
