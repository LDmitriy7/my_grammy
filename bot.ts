import {
  Bot as _Bot,
  Context,
  DenoKVAdapter,
  env,
  hydrateReply,
  InlineKeyboardButton,
  MessageEntity,
  parseMode,
  run,
  sequentialize,
  session,
  Update,
} from "./deps.ts"
import { sendPhoto, setKeyboard } from "./lib.ts"
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
    this.catch(console.error)
    run(this, { runner: { fetch: { allowed_updates } } })
  }

  setKeyboard(
    chatId: number | string,
    msgId: number,
    inline_keyboard: InlineKeyboardButton[][],
  ) {
    return setKeyboard(this, chatId, msgId, inline_keyboard)
  }

  sendPhoto(
    chatId: number,
    photoId: string,
    text?: string,
    entities?: MessageEntity[],
  ) {
    return sendPhoto(this, chatId, photoId, text, entities)
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
