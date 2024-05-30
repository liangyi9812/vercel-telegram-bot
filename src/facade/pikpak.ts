import createDebug from "debug"
import { Context } from "telegraf"
import AdmZip from "adm-zip"
import {
  dispatchWorkflow,
  downloadWorkflowLogs,
  listWorkflowRuns,
} from "../github/api"
import {
  ActionConclusionEnum,
  ActionStatusEnum,
  PikPakActionTypeEnum,
} from "../types/enum"
import { DispatchWorkflowParam, WorkFlowInfo, WorkFlowRunInfo } from "../types"
import { $, isDev } from "../core"

const log = createDebug("pikpak")

const dispatchWorkflowParam: DispatchWorkflowParam = {
  owner: "liangyi9812",
  repo: "pikpak_scripts",
  workflow_id: "register.yaml",
  ref: "master",
}

export const dispatchPikPakAction = async (ctx: Context) => {
  const param = dispatchWorkflowParam
  const actionType =
    isDev ? PikPakActionTypeEnum.MANUAL : PikPakActionTypeEnum.TELEGRAM_WEBHOOK
  const gitActionUrl = $.concatActionUrl(param)
  const success = await dispatchWorkflow(param, actionType)
  // pending
  if (success) {
    await ctx.replyWithMarkdownV2(
      `PikPak 账号创建中\\~ [查看运行状态](${gitActionUrl})`
    )
    if (isDev) {
      Promise.resolve()
        .delay(500)
        .then(() => checkStatus(ctx))
    }
  } else {
    await ctx.reply("PikPak 账号创建失败, 请联系管理员!")
  }
}

const checkStatus = async (ctx: Context) => {
  let index = 1
  while (true) {
    let { id, status, conclusion, html_url } = await getNewestPikPakRun()
    if (!conclusion) {
      // !conclusion ==> 进行中
      let messageId = null,
        processTime = 0
      while (status !== ActionStatusEnum.COMPLETED) {
        ;({ status, conclusion } = await getNewestPikPakRun())
        if (messageId) {
          await ctx.telegram.editMessageText(
            ctx.chat?.id,
            messageId,
            undefined,
            `${processTime++}.状态: ${translateStatus(status)}...`
          )
        } else {
          await ctx
            .reply(`${processTime++}.状态: ${translateStatus(status)}...`)
            .then((msg) => (messageId = msg.message_id))
        }
        // 间隔 5s
        await $.sleep(5000)
      }
      // 完成, 判断conclusion
      if (conclusion !== ActionConclusionEnum.SUCCESS) {
        await ctx.replyWithMarkdownV2(
          `PikPak账号创建失败⚠️, [查看明细](${html_url})`
        )
      } else {
        try {
          const { email, password } = await getResultByRunId({
            ...dispatchWorkflowParam,
            run_id: id,
          })
          if (email && password) {
            await ctx.reply(
              `PikPak账号创建成功⭐\nemail: ${email}\npassword: ${password}`
            )
          } else {
            await ctx.replyWithMarkdownV2(
              `PikPak账号提取失败⚠️, [查看明细](${html_url})`
            )
          }
        } catch (error) {
          await ctx.reply(`PikPak账号提取错误⚠️, 请检查日志`)
        }
      }
      return
    } else if (index === 5) {
      // 重试完了 5 次
      await ctx.reply(`not find any action... please wait`)
      return
    }
    log(`没有找到正在进行中的action, 重试${index++}...`)
  }
}

const translateStatus = (status: ActionStatusEnum) => {
  let text
  switch (status) {
    case ActionStatusEnum.QUEUED:
      text = "排队中"
      break
    case ActionStatusEnum.IN_PROGRESS:
      text = "执行中"
      break
    case ActionStatusEnum.WAITING:
      text = "等待中"
      break
    case ActionStatusEnum.PENDING:
      text = "待处理"
      break
    case ActionStatusEnum.COMPLETED:
      text = "已完成"
      break
    default:
      log("status 未定义 ==> " + status)
      text = "未定义"
  }
  return text
}

const getNewestPikPakRun = async () => {
  const param: WorkFlowInfo = dispatchWorkflowParam
  const path = `.github/workflows/${param.workflow_id}`
  return listWorkflowRuns(param, 1).then(async (data) => {
    const { workflow_runs } = data
    return workflow_runs[0]
  })
}

const getResultByRunId = async (param: WorkFlowRunInfo) => {
  const buffer = await downloadWorkflowLogs(param)
  const zip = new AdmZip(buffer)
  for (const zipEntry of zip.getEntries()) {
    if (
      zipEntry.entryName.includes("extract_userinfo") &&
      zipEntry.entryName.endsWith(".txt")
    ) {
      const content = zipEntry.getData().toString("utf-8")
      // 在最后两行
      // 倒数第二行 => 账号
      // 倒数第一行 => 密码
      const emailMatches = content.matchAll(/email\?(\S+)/gm)
      const passwordMatches = content.matchAll(/password\?(\S+)/gm)
      let email = null,
        password = null
      for (const item of emailMatches) {
        // 最后一个
        // RegExpMatchArray, 第一个参数是完整匹配的字符串, 第二个以及后序是匹配结果
        email = item[1]
      }
      for (const item of passwordMatches) {
        // 最后一个
        password = item[1]
      }
      return {
        email: email,
        password: password,
      }
    }
  }
  return {
    email: null,
    password: null,
  }
}
