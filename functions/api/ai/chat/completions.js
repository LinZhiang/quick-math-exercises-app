import { handleChatCompletions } from '../../../_lib/wenguCloudAuth.js'

export async function onRequestPost(context) {
  return handleChatCompletions(context.env, context.request)
}
