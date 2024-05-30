import createDebug from "debug"
import { Context } from "telegraf"
import { dispatchPikPakAction } from "../facade/pikpak"

const log = createDebug("bot:define")

export const newPikPak = async (ctx: Context) => dispatchPikPakAction(ctx)
