import expressCors from "cors"
import { config } from "./constants.js"

console.log(`Configuring cors with origin: '${config.allowedOrigins}'`)

const corsConfig = expressCors({
  origin: config.allowedOrigins,
  credentials: true,
})

export default corsConfig
