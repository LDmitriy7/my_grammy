import { Update } from "tg"
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

const getToken = () => env.str("TOKEN")

export class Bot<S extends BaseSession> extends _Bot<BaseContext<S>> {
  constructor(token: string | null, defaultSession: S) {
    super(token ?? getToken())
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
    return new Bot(null, defaultSession)
  }

  async run(allowed_updates = ALLOWED_UPDATES) {
    await this.api.deleteWebhook()
    run(this, { runner: { fetch: { allowed_updates } } })
  }
}

type AllowedUpdates = ReadonlyArray<Exclude<keyof Update, "update_id">>
const ALLOWED_UPDATES: AllowedUpdates = [
  "channel_post",
  "message",
  "callback_query",
]

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
