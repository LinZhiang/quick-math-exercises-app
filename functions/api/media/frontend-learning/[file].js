import { handleFrontendLearningMedia } from '../../../_lib/frontendLearningCloud.js'

export async function onRequestGet(context) {
  return handleFrontendLearningMedia(context.env, context.params.file, context.request)
}
