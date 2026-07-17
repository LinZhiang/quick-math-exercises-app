import { handleDeleteUser, handlePatchUser } from '../../_lib/wenguCloudAuth.js'

export async function onRequestPatch(context) {
  return handlePatchUser(context.env, context.request, context.params.username)
}

export async function onRequestDelete(context) {
  return handleDeleteUser(context.env, context.request, context.params.username)
}
