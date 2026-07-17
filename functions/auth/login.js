import { handleLogin } from '../_lib/wenguCloudAuth.js'

export async function onRequestPost(context) {
  return handleLogin(context.env, context.request)
}
