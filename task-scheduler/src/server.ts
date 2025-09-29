import { app } from "./app"

process.on('SIGINT', () => app.gracefulShutDown())
process.on('SIGTERM', () => app.gracefulShutDown())


app.start().catch(console.error)