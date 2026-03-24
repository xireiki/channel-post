import fs from "fs";
import os from "os";
import TelegramBot from "node-telegram-bot-api";
import { TelegramClient } from "teleproto";
import { StringSession } from "teleproto/sessions/index.js";
import { setOutput } from "./utils.js";

async function myTelegramClient(api_id, api_hash, bot_token) {
    let sessionString = "";
    if (fs.existsSync("bot.session")) {
        sessionString = fs.readFileSync("bot.session", "utf-8");
    }
    const session = new StringSession(sessionString);
    const client = new TelegramClient(session, Number(api_id), api_hash, {
        connectionRetries: 5,
    });

    return await client.start({
        botAuthToken: bot_token,
        onError: (err) => {
            throw new Error(err.message);
        },
    }).then(() => {
        console.log("TelegramClient started");
        return client;
    }).catch(err => {
        throw new Error(err.message);
    })
}

class postClient {
    constructor(bot_token, api_id = null, api_hash = null, useProto = false) {
        this.bot_token = bot_token;
        this.api_id = api_id;
        this.api_hash = api_hash;
        this.useProto = useProto;
    }

    async init() {
        if (!this.useProto) {
            console.log("Using TelegramBot");
            this.client = new TelegramBot(this.bot_token);
        } else if (this.api_id && this.api_hash) {
            console.log("Using TelegramClient");
            try {
                this.client = await myTelegramClient(this.api_id, this.api_hash, this.bot_token);
            } catch (err) {
                throw new Error(`Failed to initialize TelegramClient: ${err.message}`);
            }
        } else {
            throw new Error("api_id and api_hash are required for TelegramClient (\"large_file\" = true)");
        }
    }

    close() {
        if (this.useProto && this.client) {
            const sessionString = this.client.session.save();
            fs.writeFileSync("bot.session", sessionString);
            this.client.disconnect();
            console.log("TelegramClient disconnected");
        }
    }

    async sendMessage(ChatId, Msg, option = {}) {
        if (this.useProto) {
            const messageOptions = {
                message: Msg
            };
            if (option.parse_mode) {
                messageOptions.parseMode = option.parse_mode.toLowerCase();
            }
            return await this.client.sendMessage(ChatId, messageOptions);
        } else {
            return await this.client.sendMessage(ChatId, Msg, option == {} ? undefined : option);
        }
    }

    async sendDocument(ChatId, FilePath, option = {}) {
        if (this.useProto) {
            console.log("Using TelegramClient to send file:", FilePath);
            const sendOptions = {
                file: FilePath
            };
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            return await this.client.sendFile(ChatId, sendOptions);
        } else {
            console.log("Using TelegramBot to send document:", FilePath);
            return await this.client.sendDocument(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendPhoto(ChatId, FilePath, option = {}) {
        if (this.useProto) {
            const sendOptions = {
                file: FilePath
            };
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            return await this.client.sendFile(ChatId, sendOptions);
        } else {
            return await this.client.sendPhoto(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendAudio(ChatId, FilePath, option = {}) {
        if (this.useProto) {
            const sendOptions = {
                file: FilePath
            };
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            return await this.client.sendFile(ChatId, sendOptions);
        } else {
            return await this.client.sendAudio(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendVideo(ChatId, FilePath, option = {}) {
        if (this.useProto) {
            const sendOptions = {
                file: FilePath
            };
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            return await this.client.sendFile(ChatId, sendOptions);
        } else {
            return await this.client.sendVideo(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendMediaGroup(ChatId, MediaArray, option = {}) {
        if (this.useProto) {
            // TelegramClient supports file arrays to send as media group
            const files = [];
            const captions = [];
            
            for (const media of MediaArray) {
                files.push(media.media);
                captions.push(media.caption || "");
            }
            
            const sendOptions = {
                file: files,
                caption: captions
            };
            
            // Check if all media items are documents
            const allDocuments = MediaArray.every(m => m.type === "document");
            if (allDocuments) {
                sendOptions.forceDocument = true;
            }
            
            if (MediaArray[0]?.parseMode) {
                sendOptions.parseMode = MediaArray[0].parseMode;
            }
            
            if (option.message_thread_id) {
                // Note: topic_id is not directly supported in sendFile for TelegramClient
                // It would need special handling via replyTo
            }
            
            const result = await this.client.sendFile(ChatId, sendOptions);
            return result;
        } else {
            const result = await this.client.sendMediaGroup(ChatId, MediaArray, option == {} ? undefined : option);
            return result;
        }
    }
}

export { postClient };
