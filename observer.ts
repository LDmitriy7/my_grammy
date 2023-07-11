import { Composer } from "./deps.ts"
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

  // deno-lint-ignore no-explicit-any
  set handler(callback: (ctx: C) => any) {
    this.composer.use(callback)
  }

  filter(predicate: (ctx: C) => boolean) {
    return this.branch(this.composer.filter(predicate))
  }

  command = (value: Command) => this.branch(this.composer.command(value))
  text = () => this.branch(this.composer.on("message:text"))
  message = () => this.branch(this.composer.on("message"))
  button = (text: string) => this.filter((c) => c.message?.text == text)

  query = (prefix: QueryPrefix) =>
    this.filter((ctx) => {
      const data = ctx.callbackQuery?.data
      return data ? data.startsWith(prefix) : false
    })

  state<O>(value: State) {
    return this.filter((c) => c.session.state == value) as O
  }
}
