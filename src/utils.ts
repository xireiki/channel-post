import fs from "fs";
import { globSync } from 'glob';
import * as core from "@actions/core";
import { TelegramMediaType, MediaGroupItem } from "./types.js";

function _getMediaTelegramType(path: string): TelegramMediaType {
    const photoType = [
        ".jpg", ".png", ".jpeg", ".webp", ".gif"
    ];
    const videoType = [
        ".mp4", ".flv", ".avi", ".webm", ".mov",
        ".rmvb", ".3gp", ".3g2", ".wmv", ".mpeg"
    ];
    
    for (const t of photoType) {
        if (path.endsWith(t)) {
            return "photo";
        }
    }
    
    for (const t of videoType) {
        if (path.endsWith(t)) {
            return "video";
        }
    }
    
    return "document";
}

function _setOutput(key: string, value: string | number): void {
    core.setOutput(key, value.toString());
}

function sendDocument(Bot: any, ChatId: string, path: string, option: any = {}, fileOption: any = {}): Promise<void> {
    if (typeof path != "string" || path.indexOf("\n") >= 0) {
        throw new Error("Multiple files are not supported, use sendFile or sendMediaGroup");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    
    return Bot.sendDocument(ChatId, path, Object.keys(option).length === 0 ? undefined : option, Object.keys(fileOption).length === 0 ? undefined : fileOption)
        .then((result: any) => {
            console.log("File sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch((err: Error) => {
            throw new Error(err.message);
        });
}

function sendPhoto(Bot: any, ChatId: string, path: string, option: any = {}, fileOption: any = {}): Promise<void> {
    if (typeof path != "string") {
        throw new Error("Multiple files are not supported");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    
    return Bot.sendPhoto(ChatId, path, Object.keys(option).length === 0 ? undefined : option, Object.keys(fileOption).length === 0 ? undefined : fileOption)
        .then((result: any) => {
            console.log("Photo sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch((err: Error) => {
            throw new Error(err.message);
        });
}

function sendAudio(Bot: any, ChatId: string, path: string, option: any = {}, fileOption: any = {}): Promise<void> {
    if (typeof path != "string") {
        throw new Error("Multiple files are not supported");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    
    return Bot.sendAudio(ChatId, path, Object.keys(option).length === 0 ? undefined : option, Object.keys(fileOption).length === 0 ? undefined : fileOption)
        .then((result: any) => {
            console.log("Audio sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch((err: Error) => {
            throw new Error(err.message);
        });
}

function sendVideo(Bot: any, ChatId: string, path: string, option: any = {}, fileOption: any = {}): Promise<void> {
    if (typeof path != "string") {
        throw new Error("Multiple files are not supported");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    
    return Bot.sendVideo(ChatId, path, Object.keys(option).length === 0 ? undefined : option, Object.keys(fileOption).length === 0 ? undefined : fileOption)
        .then((result: any) => {
            console.log("Video sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch((err: Error) => {
            throw new Error(err.message);
        });
}

function sendMediaGroup(Bot: any, ChatId: string, media: MediaGroupItem[]): Promise<void> {
    if (!Array.isArray(media) || (Array.isArray(media) && (media.length < 2 || media.length > 10))) {
        throw new Error("sendMediaGroup requires 2-10 media files");
    }
    
    for (const item of media) {
        if (!fs.existsSync(item.media)) {
            throw new Error(`File not found: ${item.media}`);
        }
    }
    
    return Bot.sendMediaGroup(ChatId, media)
        .then((result: any) => {
            console.log("MediaGroup sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch((err: Error) => {
            throw new Error(err.message);
        });
}

function sendMessage(Bot: any, ChatId: string, Msg: string, option: any = {}, useProtoApi: boolean = false): Promise<void> {
    console.log("Sending message...");
    
    if (useProtoApi) {
        console.log("Using TelegramClient to send message");
        return Bot.sendMessage(ChatId, { message: Msg, ...option })
            .then((result: any) => {
                console.log("Message sent");
                _setOutput("msgId", result["message_id"]);
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    } else {
        return Bot.sendMessage(ChatId, Msg, Object.keys(option).length === 0 ? undefined : option)
            .then((result: any) => {
                console.log("Message sent");
                _setOutput("msgId", result["message_id"]);
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });
    }
}

function getFiles(path: string): string[] {
    const finalPaths: string[] = [];
    let paths = path.split("\n");
    
    for (let m = 0; m < paths.length; m++) {
        const currentPath = paths[m];
        if (currentPath && currentPath.indexOf("*") >= 0) {
            const files = globSync(currentPath);
            files.forEach(file => {
                finalPaths.push(file);
            });
        } else if (currentPath) {
            finalPaths.push(currentPath);
        }
    }
    
    return finalPaths;
}

function sleep(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export {
    _setOutput as setOutput,
    _getMediaTelegramType as getMediaTelegramType,
    sendDocument,
    sendPhoto,
    sendAudio,
    sendVideo,
    sendMediaGroup,
    sendMessage,
    getFiles,
    sleep
};