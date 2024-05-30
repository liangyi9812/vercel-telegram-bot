import { VercelRequest, VercelResponse } from "@vercel/node"
import { bot, beforeHandle } from "../src/core"

export default async function handle(req: VercelRequest, res: VercelResponse) {
  beforeHandle(req, res, async () => {
    const CHAT_ID = process.env.CHAT_ID || ""
    if (!CHAT_ID) {
      throw new Error("admin chat_id can't be null")
    }
    const msg = await bot.telegram.sendMessage(
      CHAT_ID,
      JSON.stringify(req.body, null, 2) || "未收到任何消息, 请检查入参!"
    )
    const {
      chat: { id },
      message_id,
    } = msg
    res.status(200).json({
      chat_id: id,
      message_id: message_id,
    })
  })
}
