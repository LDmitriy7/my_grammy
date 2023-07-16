import { Composer, FilterQuery } from "./deps.ts"
import { BaseContext } from "./types.ts"

export class Observer<
  C extends BaseContext,
  Command extends string = string,
  State extends string = string,
  QueryPrefix extends string = string,
> {
  constructor(public composer: Composer<C>) {}

  branch<_C extends C>(composer: Composer<_C>) {
    return new Observer<_C, Command, State, QueryPrefix>(composer)
  }

  on(query: FilterQuery) {
    return this.branch(this.composer.on(query))
  }

  message = () => this.on("message")
  channelPost = () => this.on("channel_post")
  anyQuery = () => this.on("callback_query")
  text = () => this.on("message:text")
  photo = () => this.on("message:photo")
  video = () => this.on("message:video")
  audio = () => this.on("message:audio")
  contact = () => this.on("message:contact")
  sticker = () => this.on("message:sticker")

  // deno-lint-ignore no-explicit-any
  set handler(callback: (ctx: C) => any) {
    this.composer.use(callback)
  }

  filter(predicate: (ctx: C) => boolean) {
    return this.branch(this.composer.filter(predicate))
  }

  command = (value: Command) => this.branch(this.composer.command(value))
  button = (text: string) => this.filter((c) => c.message?.text == text)

  query = (prefix: QueryPrefix) =>
    this.filter((ctx) => {
      const data = ctx.callbackQuery?.data
      return data ? data.startsWith(prefix) : false
    })

  state(value: State) {
    return this.filter((c) => c.session.state == value)
  }
}
