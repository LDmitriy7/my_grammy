import {
  InlineKeyboard,
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  MessageEntity,
  mongoose,
} from "./deps.ts"
import { Msg } from "./msg.ts"
import { BaseContext } from "./types.ts"

export function connectToMongo(db: string, host: string, password: string) {
  mongoose.connect(
    `mongodb://root:${password}@${host}:27017/${db}?authSource=admin`,
  )
}

const sendOptions = { disable_web_page_preview: true }

const sendMessage = (ctx: BaseContext, chatId: number, msg: Msg) =>
  ctx.api.sendMessage(
    chatId,
    msg.text,
    { ...sendOptions, reply_markup: msg.keyboard },
  )

const reply = (ctx: BaseContext, msg: Msg) =>
  sendMessage(ctx, ctx.chat!.id, msg)

const setState = <State extends string>(ctx: BaseContext, state?: State) =>
  ctx.session.state = state

function parseEntity(entity: MessageEntity, text: string) {
  return text.slice(entity.offset, entity.offset + entity.length)
}

function addButtons(
  kb: InlineKeyboard,
  buttons: InlineKeyboardButton[],
  rowWidth = 1,
) {
  let count = 0
  for (const button of buttons) {
    if (count == rowWidth) {
      kb.row()
      count = 0
    }
    kb.add(button)
    count += 1
  }
  return kb.row()
}

function removePrefix(s: string, prefix: string) {
  if (!s.startsWith(prefix)) return s
  return s.replace(prefix, "")
}

function exclude<T>(array: T[], value: T) {
  return array.filter((item) => item !== value)
}

type ReplyMarkup = InlineKeyboardMarkup

export function editReplyMarkup(ctx: BaseContext, keyboard: ReplyMarkup) {
  return ctx.editMessageReplyMarkup({ reply_markup: keyboard })
}

export function editText(ctx: BaseContext, msg: Msg) {
  return ctx.editMessageText(msg.text, {
    reply_markup: msg.keyboard,
    disable_web_page_preview: true,
  })
}

function Time(date?: Date) {
  if (!date) date = new Date()
  return date.getTime() / 1000
}

const CALLBACK_DATA_SEPARATOR = ":"

export function CallbackData<Prefix extends string>(
  prefix: Prefix,
  payload: string,
) {
  return `${prefix}${CALLBACK_DATA_SEPARATOR}${payload}`
}

export function PrefixButton<Prefix extends string>(
  prefix: Prefix,
  text?: string,
) {
  return CallbackButton(prefix, text)
}

export function CallbackButton(
  data: string,
  text?: string,
): InlineKeyboardButton {
  return { text: text ?? data, callback_data: data }
}

export function parseQuery(ctx: BaseContext, prefix: string) {
  return removePrefix(
    ctx.callbackQuery!.data!,
    prefix + CALLBACK_DATA_SEPARATOR,
  )
}

export {
  addButtons,
  exclude,
  Msg,
  parseEntity,
  removePrefix,
  reply,
  sendMessage,
  setState,
  Time,
}