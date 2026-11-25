import { handleHistoryNotesMedia } from '../../../_lib/historyNotesCloud.js'

export async function onRequestGet(context) {
  return handleHistoryNotesMedia(context.env, context.params.file, context.request)
}
