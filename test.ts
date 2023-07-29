import { Bot } from "./mod.ts"

const bot = Bot.fromEnv({})
bot.run()
console.log("Started")
