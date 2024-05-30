import { VercelRequest, VercelResponse } from "@vercel/node"
import { prod, bot, beforeHandle } from "../src/core"

export default async function handle(req: VercelRequest, res: VercelResponse) {
  beforeHandle(req, res, async () => {
    await prod(req, res, bot)
  })
}
