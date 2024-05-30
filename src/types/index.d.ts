import { ActionConclusionEnum, ActionStatusEnum } from "./enum"

export type RepoInfo = {
  owner: string
  repo: string
}

export type WorkFlowRunInfo = RepoInfo & {
  // run id
  run_id: number
}

export type WorkFlowInfo = RepoInfo & {
  workflow_id: string
}

export type DispatchWorkflowParam = WorkFlowInfo & {
  ref: string
}

export type WorkFlowRunResult = {
  // 9275926874
  id: number
  // "register PikPak"
  name: string
  status: ActionStatusEnum
  conclusion: ActionConclusionEnum | null
  // ".github/workflows/register.yaml"
  path: string
  html_url: string
}
