import { handleAuthConfig } from '../_lib/wenguCloudAuth.js'

export async function onRequestGet(context) {
  return handleAuthConfig(context.env)
}
