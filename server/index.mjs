import { createAiProxyApp, logStartup, onListenError, PORT, warnIfMissingEnv } from './ai-proxy-core.mjs'

warnIfMissingEnv()

const app = createAiProxyApp()
const httpServer = app.listen(PORT, '0.0.0.0', logStartup)
httpServer.on('error', onListenError)
