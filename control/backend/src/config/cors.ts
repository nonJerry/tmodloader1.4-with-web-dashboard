import expressCors from "cors";
import { ALLOWED_ORIGINS } from "./constants.js";

console.log(`Configuring cors with origin: '${ALLOWED_ORIGINS}'`);

const corsConfig = expressCors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
});

export default corsConfig;