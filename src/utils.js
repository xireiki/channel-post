import fs from "fs";
import os from "os";
import { globSync } from 'glob';
import core from "@actions/core";

function _getMediaTelegramType(path) {
    const photoType = [
        ".jpg", ".png", ".jpeg", ".webp", ".gif"
    ]
    const videoType = [
        ".mp4", ".flv", ".avi", ".webm", ".mov",
        ".rmvb", ".3gp", ".3g2", ".wmv", ".mpeg"
    ]
    for (const t of photoType) {
        if (path.endsWith(t)) {
            return "photo"
        }
    }
    for (const t of videoType) {
        if (path.endsWith(t)) {
            return "video"
        }
    }
    return "document";
}

function _setOutput(key, value) {
    core.setOutput(key, value);
}

function sendDocument(Bot, ChatId, path, option = {}, fileOption = {}) {
    if (typeof path != "string" || path.indexOf("\n") >= 0) {
        throw new Error("Multiple files are not supported, use sendFile or sendMediaGroup");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    return Bot.sendDocument(ChatId, path, option == {} ? undefined : option, fileOption == {} ? undefined : fileOption)
        .then(result => {
            console.log("File sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch(err => {
            throw new Error(err.message);
        });
}

function sendPhoto(Bot, ChatId, path, option = {}, fileOption = {}) {
    if (typeof path != "string") {
        throw new Error("Multiple files are not supported");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    return Bot.sendPhoto(ChatId, path, option == {} ? undefined : option, fileOption == {} ? undefined : fileOption)
        .then(result => {
            console.log("Photo sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch(err => {
            throw new Error(err.message);
        });
}

function sendAudio(Bot, ChatId, path, option = {}, fileOption = {}) {
    if (typeof path != "string") {
        throw new Error("Multiple files are not supported");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    return Bot.sendAudio(ChatId, path, option == {} ? undefined : option, fileOption == {} ? undefined : fileOption)
        .then(result => {
            console.log("Audio sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch(err => {
            throw new Error(err.message);
        });
}

function sendVideo(Bot, ChatId, path, option = {}, fileOption = {}) {
    if (typeof path != "string") {
        throw new Error("Multiple files are not supported");
    }
    if (!fs.existsSync(path)) {
        throw new Error(`File not found: ${path}`);
    }
    return Bot.sendVideo(ChatId, path, option == {} ? undefined : option, fileOption == {} ? undefined : fileOption)
        .then(result => {
            console.log("Video sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch(err => {
            throw new Error(err.message);
        });
}

function sendMediaGroup(Bot, ChatId, media) {
    if (!Array.isArray(media) || (Array.isArray(media) && (media.length < 2 || media.length > 10))) {
        throw new Error("sendMediaGroup requires 2-10 media files");
    }
    for (const path of media) {
        if (!fs.existsSync(path["media"])) {
            throw new Error(`File not found: ${path["media"]}`);
        }
    }
    return Bot.sendMediaGroup(ChatId, media)
        .then(result => {
            console.log("MediaGroup sent");
            _setOutput("msgId", result["message_id"]);
        })
        .catch(err => {
            throw new Error(err.message);
        });
}

function sendMessage(Bot, ChatId, Msg, option = {}, useProtoApi = false) {
    console.log("Sending message...");
    if (useProtoApi) {
        console.log("Using TelegramClient to send message");
        return Bot.sendMessage(ChatId, { message: Msg, ...option })
            .then(result => {
                console.log("Message sent");
                _setOutput("msgId", result["message_id"]);
            })
            .catch(err => {
                throw new Error(err.message);
            });
    } else {
        return Bot.sendMessage(ChatId, Msg, option == {} ? undefined : option)
            .then(result => {
                console.log("Message sent");
                _setOutput("msgId", result["message_id"]);
            })
            .catch(err => {
                throw new Error(err.message);
            });
    }
}

function getFiles(path) {
    const finalPaths = [];
    let paths = path.split("\n");
    for (let m in paths) {
        if (paths[m].indexOf("*") >= 0) {
            const files = globSync(paths[m])
            files.forEach(file => {
                finalPaths.push(file);
            });
        } else {
            finalPaths.push(paths[m]);
        }
    }
    return finalPaths;
}

function sleep(time) {
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
