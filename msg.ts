import { InlineKeyboard } from "./deps.ts"

export class Msg {
  constructor(public text: string, public keyboard?: InlineKeyboard) {}
}
