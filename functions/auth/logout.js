import { handleLogout } from '../_lib/wenguCloudAuth.js'

export async function onRequestPost(context) {
  return handleLogout(context.env, context.request)
}
