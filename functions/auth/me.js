import { handleMe } from '../_lib/wenguCloudAuth.js'

export async function onRequestGet(context) {
  return handleMe(context.env, context.request)
}
