import { Context, ParseModeFlavor, SessionFlavor } from "./deps.ts"

export type Session = {
  state: string
}

type BaseContext<S extends Session = Session> =
  & ParseModeFlavor<Context>
  & SessionFlavor<S>

export type { BaseContext }
