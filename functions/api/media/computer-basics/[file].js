import { handleComputerBasicsMedia } from '../../../_lib/computerBasicsCloud.js'

export async function onRequestGet(context) {
  return handleComputerBasicsMedia(context.env, context.params.file, context.request)
}
