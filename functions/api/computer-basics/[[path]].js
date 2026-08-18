import { handleComputerBasics } from '../../_lib/computerBasicsCloud.js'

export async function onRequest(context) {
  return handleComputerBasics(context.env, context.request, context.params.path)
}
