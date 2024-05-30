import axios, { AxiosError, AxiosResponse } from "axios"
import createDebug from "debug"
import { PikPakActionTypeEnum } from "../types/enum"
import {
  DispatchWorkflowParam,
  RepoInfo,
  WorkFlowInfo,
  WorkFlowRunInfo,
  WorkFlowRunResult,
} from "../types"

const log = createDebug("axios:github")

const GITHUB_API_TOEKN = process.env.GITHUB_API_TOEKN
if (!GITHUB_API_TOEKN) {
  throw new Error("GITHUB_API_TOEKN can't be null")
}

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${GITHUB_API_TOEKN}`,
  },
})

githubApi.interceptors.request.use(
  (config) => {
    log(`request for ${config.url}`)
    return config
  },
  (err: AxiosError) => {
    throw new Error(`${err.message || err}`)
  }
)

githubApi.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    throw new Error(`${err.message || err}`)
  }
)

export const dispatchWorkflow = async (
  param: DispatchWorkflowParam,
  actionType: PikPakActionTypeEnum
) => {
  const { owner, repo, workflow_id, ref } = param
  const res = await githubApi.post(
    `/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`,
    {
      ref: ref,
      inputs: {
        action_type: actionType,
      },
    }
  )
  return res.status === 204
}

export const listWorkflowRuns = async (
  param: RepoInfo,
  perPage: number = 5
): Promise<{ workflow_runs: WorkFlowRunResult[] }> => {
  const { owner, repo } = param
  const res = await githubApi.get(`/repos/${owner}/${repo}/actions/runs`, {
    params: { perPage: perPage },
  })
  return res.data
}

export const downloadWorkflowLogs = async (param: WorkFlowRunInfo) => {
  const { owner, repo, run_id } = param
  const res: AxiosResponse<Buffer> = await githubApi
    .get(`/repos/${owner}/${repo}/actions/runs/${run_id}/logs`, {
      responseType: "arraybuffer",
      maxRedirects: 5,
    })
    .catch((error) => {
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status
        if (status === 302 && error.response.headers.location) {
          const redirectUrl = error.response.headers.location
          return githubApi.get(redirectUrl, { responseType: "arraybuffer" })
        }
      }
      throw error
    })
  return res.data
}
