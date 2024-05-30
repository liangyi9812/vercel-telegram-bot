import { VercelRequest, VercelResponse } from "@vercel/node"
import { bot, beforeHandle } from "../src/core"

export default async function handle(req: VercelRequest, res: VercelResponse) {
  beforeHandle(req, res, () => {
    const CHAT_ID = process.env.CHAT_ID || ""
    if (!CHAT_ID) {
      throw new Error("admin chat_id can't be null")
    }
    bot.telegram.sendMessage(
      CHAT_ID,
      JSON.stringify(req.body, null, 2) || "未收到任何消息, 请检查入参!"
    )
  })
}
