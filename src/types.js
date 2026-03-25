
import { getParams } from "./params.js";

const { bot_token } = getParams();

export const CACHE_PATH = [`bot-${bot_token.split(":")[0]}.session`];
export const CACHE_KEY = `session-${bot_token.split(":")[0]}`;
