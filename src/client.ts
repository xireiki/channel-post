import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import { TelegramClient } from "teleproto";
import { StringSession } from "teleproto/sessions/index.js";
import { CustomFile } from "teleproto/client/uploads.js";
import { CACHE_PATH } from "./types.js";
import { ClientOptions, MessageResult, MediaGroupItem } from "./types.js";

async function myTelegramClient(api_id: number, api_hash: string, bot_token: string): Promise<TelegramClient> {
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
        onError: (err: Error) => {
            throw new Error(err.message);
        },
    }).then(() => {
        console.log("TelegramClient started");
        return client;
    }).catch(err => {
        throw new Error(err.message);
    });
}

class postClient {
    private bot_token: string;
    private api_id: number | null;
    private api_hash: string | null;
    private useProto: boolean;
    private client: any;

    constructor(bot_token: string, api_id: number | null = null, api_hash: string | null = null, useProto: boolean = false) {
        this.bot_token = bot_token;
        if (api_id && api_id > 0) {
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

    async init(): Promise<void> {
        if (!this.useProto) { // 使用 node-telegram-bot-api
            console.log("Using TelegramBot");
            this.client = new TelegramBot(this.bot_token);
        } else { // 使用 teleproto 的 TelegramClient
            console.log("Using TelegramClient");
            try {
                if (!this.api_id || !this.api_hash) {
                    throw new Error("api_id and api_hash are required for TelegramClient");
                }
                this.client = await myTelegramClient(this.api_id, this.api_hash, this.bot_token);
            } catch (err: any) {
                throw new Error(`Failed to initialize TelegramClient: ${err.message}`);
            }
        }
    }

    close(): void {
        if (this.useProto && this.client) {
            const sessionString = this.client.session.save();
            fs.writeFileSync(CACHE_PATH[0], sessionString);
            this.client.disconnect();
            console.log("TelegramClient disconnected");
        }
    }

    async sendMessage(ChatId: string, Msg: string, option: ClientOptions = {}): Promise<MessageResult> {
        if (this.useProto) {
            const messageOptions: any = {
                message: Msg
            };
            if (option.parse_mode) {
                messageOptions.parseMode = option.parse_mode.toLowerCase();
            }
            return await this.client.sendMessage(ChatId, messageOptions);
        } else {
            return await this.client.sendMessage(ChatId, Msg, Object.keys(option).length === 0 ? undefined : option);
        }
    }

    async sendDocument(ChatId: string, FilePath: string, option: ClientOptions = {}): Promise<MessageResult> {
        if (this.useProto) {
            const fileSize = fs.statSync(FilePath).size;
            
            // 根据文件大小动态调整workers数量，最大化并发
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions: any = {
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
            } catch (err: any) {
                console.log("sendFile failed: ", err.message);
                throw err;
            }
        } else {
            console.log("Using TelegramBot to send document:", FilePath);
            return await this.client.sendDocument(ChatId, FilePath, Object.keys(option).length === 0 ? undefined : option);
        }
    }

    async sendPhoto(ChatId: string, FilePath: string, option: ClientOptions = {}): Promise<MessageResult> {
        if (this.useProto) {
            const fileSize = fs.statSync(FilePath).size;
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions: any = {
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
            } catch (err: any) {
                console.log("sendFile failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadFileAndSend(ChatId, FilePath, option, sendOptions);
            }
        } else {
            return await this.client.sendPhoto(ChatId, FilePath, Object.keys(option).length === 0 ? undefined : option);
        }
    }

    async sendAudio(ChatId: string, FilePath: string, option: ClientOptions = {}): Promise<MessageResult> {
        if (this.useProto) {
            const fileSize = fs.statSync(FilePath).size;
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions: any = {
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
            } catch (err: any) {
                console.log("sendFile failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadFileAndSend(ChatId, FilePath, option, sendOptions);
            }
        } else {
            return await this.client.sendAudio(ChatId, FilePath, Object.keys(option).length === 0 ? undefined : option);
        }
    }

    async sendVideo(ChatId: string, FilePath: string, option: ClientOptions = {}): Promise<MessageResult> {
        if (this.useProto) {
            const fileSize = fs.statSync(FilePath).size;
            const workers = fileSize > 100 * 1024 * 1024 ? 16 : fileSize > 50 * 1024 * 1024 ? 12 : fileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions: any = {
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
            } catch (err: any) {
                console.log("sendFile failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadFileAndSend(ChatId, FilePath, option, sendOptions);
            }
        } else {
            return await this.client.sendVideo(ChatId, FilePath, Object.keys(option).length === 0 ? undefined : option);
        }
    }

    async sendMediaGroup(ChatId: string, MediaArray: MediaGroupItem[], option: ClientOptions = {}): Promise<MessageResult | MessageResult[]> {
        if (this.useProto) {
            const files: string[] = [];
            const captions: string[] = [];
            let maxFileSize = 0;
            
            for (const media of MediaArray) {
                files.push(media.media);
                captions.push(media.caption || "");
                const size = fs.statSync(media.media).size;
                maxFileSize = Math.max(maxFileSize, size);
            }
            
            const workers = maxFileSize > 100 * 1024 * 1024 ? 16 : maxFileSize > 50 * 1024 * 1024 ? 12 : maxFileSize > 10 * 1024 * 1024 ? 8 : 4;
            
            const sendOptions: any = {
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
            } catch (err: any) {
                console.log("sendFile for album failed, attempting uploadFile + sendMessage:", err.message);
                return await this._uploadAlbumAndSend(ChatId, MediaArray, option, sendOptions);
            }
        } else {
            const result = await this.client.sendMediaGroup(ChatId, MediaArray, Object.keys(option).length === 0 ? undefined : option);
            return result;
        }
    }

    private async _uploadFileAndSend(ChatId: string, FilePath: string, option: ClientOptions, _originalSendOptions: any): Promise<MessageResult> {
        try {
            const fileName = FilePath.split("/").pop() || "file";
            const fileSize = fs.statSync(FilePath).size;
            
            const customFile = new CustomFile(fileName, fileSize, FilePath);
            
            const uploadedFile = await this.client.uploadFile({
                file: customFile,
                workers: 16,
                maxBufferSize: 512 * 1024
            });
            
            const messageOptions: any = {
                file: uploadedFile,
                message: option.caption || ""
            };
            
            if (option.parse_mode) {
                messageOptions.parseMode = option.parse_mode.toLowerCase();
            }
            
            return await this.client.sendMessage(ChatId, messageOptions);
        } catch (err: any) {
            throw new Error(`Failed to send file using uploadFile: ${err.message}`);
        }
    }

    private async _uploadAlbumAndSend(ChatId: string, MediaArray: MediaGroupItem[], _option: ClientOptions, originalSendOptions: any): Promise<MessageResult | MessageResult[]> {
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
            
            const messageOptions: any = {
                file: uploadedFiles.map(f => f.file),
                caption: uploadedFiles.map(f => f.caption)
            };
            
            if (MediaArray[0]?.parseMode) {
                messageOptions.parseMode = MediaArray[0].parseMode;
            }
            
            return await this.client.sendFile(ChatId, messageOptions);
        } catch (err: any) {
            throw new Error(`Failed to send album using uploadFile + sendFile: ${err.message}`);
        }
    }
}

export { postClient };