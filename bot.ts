import {
  Bot as _Bot,
  Context,
  DenoKVAdapter,
  env,
  hydrateReply,
  parseMode,
  run,
  sequentialize,
  session,
} from "./deps.ts"
import { BaseContext, BaseSession } from "./types.ts"

export class Bot<S extends BaseSession> extends _Bot<BaseContext<S>> {
  constructor(token: string, defaultSession: S) {
    super(token)
    this.use(sequentialize(getSessionKey))
    this.initParseModePlugin()
    this.initSessionPlugin(defaultSession)
  }

  initParseModePlugin() {
    this.api.config.use(parseMode("HTML"))
    this.use(hydrateReply)
  }

  initSessionPlugin(defaultSession: S) {
    this.use(createSessionMiddleware(defaultSession))
  }

  static fromEnv<S extends BaseSession>(defaultSession: S) {
    return new Bot(env.str("TOKEN"), defaultSession)
  }

  run() {
    run(this)
  }
}

// @ts-ignore: TODO
const kv = await Deno.openKv()
const storage = new DenoKVAdapter(kv)

function getSessionKey(ctx: Context): string | undefined {
  if (ctx.from == undefined || ctx.chat == undefined) return
  return `${ctx.chat.id}/${ctx.from.id}`
}

function createSessionMiddleware(defaultSession: BaseSession) {
  return session({
    initial: () => structuredClone(defaultSession),
    getSessionKey,
    storage,
  })
}
