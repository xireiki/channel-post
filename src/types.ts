import { getParams } from "./params.js";

const { bot_token } = getParams();

export const CACHE_PATH = [`bot-${bot_token.split(":")[0]}.session`] as [string];
export const CACHE_KEY = `session-${bot_token.split(":")[0]}`;

// 参数接口
export interface Params {
  bot_token: string;
  chat_id: string;
  context: string | string[];
  path: string;
  parse_mode: string;
  method: string;
  large_file: boolean;
  api_id: number | null;
  api_hash: string | null;
  topic_id: string;
  cache_session: boolean;
  session: string;
}

// Telegram 媒体类型
export type TelegramMediaType = 'photo' | 'video' | 'audio' | 'document';

// 媒体组项目接口
export interface MediaGroupItem {
  type: TelegramMediaType;
  media: string;
  caption?: string | undefined;
  parseMode?: string | undefined;
}

// 客户端选项接口
export interface ClientOptions {
  parse_mode?: string | undefined;
  caption?: string | undefined;
  message_thread_id?: string | undefined;
}

// 消息结果接口
export interface MessageResult {
  message_id?: number;
  id?: number;
}

// 文件信息接口
export interface FileInfo {
  name: string;
  path: string;
  size: number;
}