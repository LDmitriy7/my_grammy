import { Context, ParseModeFlavor, SessionFlavor } from "./deps.ts"

export type BaseSession = {
  state?: string
}

export type BaseContext<S extends BaseSession = BaseSession> =
  & ParseModeFlavor<Context>
  & SessionFlavor<S>
