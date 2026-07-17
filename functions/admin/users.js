import { handleCreateUser, handleListUsers } from '../_lib/wenguCloudAuth.js'

export async function onRequestGet(context) {
  return handleListUsers(context.env, context.request)
}

export async function onRequestPost(context) {
  return handleCreateUser(context.env, context.request)
}
