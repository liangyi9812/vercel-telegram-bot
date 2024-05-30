import { WorkFlowInfo } from "../types"

Promise.prototype.delay = async function <T>(
  this: Promise<T>,
  ms: number
): Promise<T> {
  const value = await this
  return await new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))
}

export class Tool {
  concatActionUrl = (actionInfo: WorkFlowInfo) => {
    const { owner, repo, workflow_id } = actionInfo
    return `https://github.com/${owner}/${repo}/actions/workflows/${workflow_id}`
  }

  escapeMarkdown = (text: string) =>
    text.replace(/[_[\]()~`>#+=\|{}.-]/g, "\\$&")

  sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(() => resolve(), ms))
}
