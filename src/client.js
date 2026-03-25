import fs from "fs";
import os from "os";
import TelegramBot from "node-telegram-bot-api";
import { TelegramClient } from "teleproto";
import { StringSession } from "teleproto/sessions/index.js";
import { CustomFile } from "teleproto/client/uploads.js";
import { setOutput } from "./utils.js";
import { CACHE_PATH } from "./types.js";

async function myTelegramClient(api_id, api_hash, bot_token) {
    let sessionString = "";
    if (fs.existsSync(CACHE_PATH[0])) {
        sessionString = fs.readFileSync(CACHE_PATH[0], "utf-8");
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
        if (api_id && api_id > 0 && api_id !== "") {
            this.api_id = api_id;
        } else {
            this.api_id = null;
        }
        if (api_hash && api_hash !== "") {
            this.api_hash = api_hash;
        } else {
            this.api_hash = null;
        }
        this.useProto = useProto;
    }

    async init() {
        if (!this.useProto) { // 使用 node-telegram-bot-api
            console.log("Using TelegramBot");
            this.client = new TelegramBot(this.bot_token);
        } else { // 使用 teleproto 的 TelegramClient
            console.log("Using TelegramClient");
            try {
                this.client = await myTelegramClient(this.api_id, this.api_hash, this.bot_token);
            } catch (err) {
                throw new Error(`Failed to initialize TelegramClient: ${err.message}`);
            }
        }
    }

    close() {
        if (this.useProto && this.client) {
            const sessionString = this.client.session.save();
            fs.writeFileSync(CACHE_PATH[0], sessionString);
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
            const fileSize = fs.statSync(FilePath).size;
            
            // 根据文件大小动态调整workers数量，最大化并发
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions = {
                file: FilePath,
                workers: workers
            };
            
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            
            try {
                return await this.client.sendFile(ChatId, sendOptions);
            } catch (err) {
                console.log("sendFile failed: ", err.message);
            }
        } else {
            console.log("Using TelegramBot to send document:", FilePath);
            return await this.client.sendDocument(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendPhoto(ChatId, FilePath, option = {}) {
        if (this.useProto) {
            const fileSize = fs.statSync(FilePath).size;
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions = {
                file: FilePath,
                workers: workers
            };
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            
            try {
                return await this.client.sendFile(ChatId, sendOptions);
            } catch (err) {
                console.log("sendFile failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadFileAndSend(ChatId, FilePath, option, sendOptions);
            }
        } else {
            return await this.client.sendPhoto(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendAudio(ChatId, FilePath, option = {}) {
        if (this.useProto) {
            const fileSize = fs.statSync(FilePath).size;
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions = {
                file: FilePath,
                workers: workers
            };
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            
            try {
                return await this.client.sendFile(ChatId, sendOptions);
            } catch (err) {
                console.log("sendFile failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadFileAndSend(ChatId, FilePath, option, sendOptions);
            }
        } else {
            return await this.client.sendAudio(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendVideo(ChatId, FilePath, option = {}) {
        if (this.useProto) {
            const fileSize = fs.statSync(FilePath).size;
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions = {
                file: FilePath,
                workers: workers
            };
            if (option.caption) {
                sendOptions.caption = option.caption;
            }
            if (option.parse_mode) {
                sendOptions.parseMode = option.parse_mode.toLowerCase();
            }
            
            try {
                return await this.client.sendFile(ChatId, sendOptions);
            } catch (err) {
                console.log("sendFile failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadFileAndSend(ChatId, FilePath, option, sendOptions);
            }
        } else {
            return await this.client.sendVideo(ChatId, FilePath, option == {} ? undefined : option);
        }
    }

    async sendMediaGroup(ChatId, MediaArray, option = {}) {
        if (this.useProto) {
            const files = [];
            const captions = [];
            let maxFileSize = 0;
            
            for (const media of MediaArray) {
                files.push(media.media);
                captions.push(media.caption || "");
                const size = fs.statSync(media.media).size;
                maxFileSize = Math.max(maxFileSize, size);
            }
            
            const workers = maxFileSize > 100 * 1024 * 1024 ? 16 : maxFileSize > 50 * 1024 * 1024 ? 12 : maxFileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions = {
                file: files,
                caption: captions,
                workers: workers
            };
            
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
            
            try {
                const result = await this.client.sendFile(ChatId, sendOptions);
                return result;
            } catch (err) {
                console.log("sendFile for album failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadAlbumAndSend(ChatId, MediaArray, option, sendOptions);
            }
        } else {
            const result = await this.client.sendMediaGroup(ChatId, MediaArray, option == {} ? undefined : option);
            return result;
        }
    }

    async _uploadFileAndSend(ChatId, FilePath, option, originalSendOptions) {
        try {
            const fileName = FilePath.split("/").pop() || "file";
            const fileSize = fs.statSync(FilePath).size;
            
            const customFile = new CustomFile(fileName, fileSize, FilePath);
            
            const uploadedFile = await this.client.uploadFile({
                file: customFile,
                workers: 16,
                maxBufferSize: 512 * 1024
            });
            
            const messageOptions = {
                file: uploadedFile,
                message: option.caption || ""
            };
            
            if (option.parse_mode) {
                messageOptions.parseMode = option.parse_mode.toLowerCase();
            }
            
            return await this.client.sendMessage(ChatId, messageOptions);
        } catch (err) {
            throw new Error(`Failed to send file using uploadFile: ${err.message}`);
        }
    }

    async _uploadAlbumAndSend(ChatId, MediaArray, option, originalSendOptions) {
        try {
            const uploadPromises = MediaArray.map(async (media) => {
                const fileName = media.media.split("/").pop() || "file";
                const fileSize = fs.statSync(media.media).size;
                
                const customFile = new CustomFile(fileName, fileSize, media.media);
                
                const uploadedFile = await this.client.uploadFile({
                    file: customFile,
                    workers: originalSendOptions.workers || 16,
                    maxBufferSize: 1 * 1024 * 1024
                });
                
                return {
                    file: uploadedFile,
                    caption: media.caption || ""
                };
            });
            
            const uploadedFiles = await Promise.all(uploadPromises);
            
            const messageOptions = {
                file: uploadedFiles.map(f => f.file),
                caption: uploadedFiles.map(f => f.caption)
            };
            
            if (MediaArray[0]?.parseMode) {
                messageOptions.parseMode = MediaArray[0].parseMode;
            }
            
            return await this.client.sendFile(ChatId, messageOptions);
        } catch (err) {
            throw new Error(`Failed to send album using uploadFile + sendFile: ${err.message}`);
        }
    }
}

export { postClient };
