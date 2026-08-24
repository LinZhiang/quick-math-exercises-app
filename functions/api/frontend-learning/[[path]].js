import { handleFrontendLearning } from '../../_lib/frontendLearningCloud.js'

export async function onRequest(context) {
  return handleFrontendLearning(context.env, context.request, context.params.path)
}
