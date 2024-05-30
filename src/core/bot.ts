import createDebug from "debug"
import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import { newPikPak } from "../command/new"
import { $ } from "./app"

const log = createDebug("bot:define")

const BOT_TOKEN = process.env.BOT_TOKEN
if (!BOT_TOKEN) {
  throw new Error("bot token can't be null")
}

const ENVIRONMENT = process.env.NODE_ENV || process.env.VERCEL_ENV
if (!ENVIRONMENT) {
  throw new Error("env must to be set!")
}

const bot = new Telegraf(BOT_TOKEN)
bot.start(async (ctx) => {
  const { first_name: firstName, last_name: LastName } = ctx.from
  const fullName = `${firstName} ${LastName}`.trim()
  await ctx.reply(`✨ Hello, ${fullName}! 发送 /help 命令可以查看详细功能介绍`)
})
// prettier-ignore
bot.help(async (ctx) => await ctx.replyWithMarkdownV2($.escapeMarkdown(`
*🚀 current enviroment: ${ENVIRONMENT}*
---------------------------------------
*😆 Here are the commands you can use:*

/new_pikpak - 创建一个新的PikPak账号
`)))
bot.hears("ping", async (ctx) => await ctx.reply("pong~"))
bot.command("new_pikpak", async (ctx) => await newPikPak(ctx))

bot.on(message("text"), async (ctx) => await ctx.reply("😣 暂不支持!"))
bot.catch(async (err, ctx) => {
  const msg = err instanceof Error ? err.message : JSON.stringify(err)
  log("bot catch error: " + msg)
  await ctx.reply(msg)
})

export { bot, ENVIRONMENT }
