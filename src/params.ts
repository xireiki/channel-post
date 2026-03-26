import * as core from "@actions/core";
import { Params } from "./types.js";

export function getParams(): Params {
    const bot_token = core.getInput("bot_token");
    const chat_id = core.getInput("chat_id");
    const context = core.getInput("context");
    let path = core.getInput("path");
    const parse_mode = core.getInput("parse_mode");
    const method = core.getInput("method");
    const large_file_input = core.getInput("large_file");
    let api_id_input = core.getInput("api_id");
    const api_hash = core.getInput("api_hash");
    const topic_id = core.getInput("topic_id");
    const cache_session_input = core.getInput("cache_session");
    const session = core.getInput("session");

    if (!bot_token) {
        core.setFailed("bot_token cannot be empty");
        process.exit();
    }
    if (!chat_id) {
        core.setFailed("chat_id cannot be empty");
        process.exit();
    }
    if (!method) {
        core.setFailed("method cannot be empty");
        process.exit();
    }
    if (method == "sendMessage") {
        if (!context) {
            core.setFailed("context cannot be empty");
            process.exit();
        }
    } else {
        if (!path) {
            core.setFailed("path cannot be empty");
            process.exit();
        }
    }

    let large_file: boolean;
    let api_id: number | null = null;
    let cache_session: boolean;
    
    if (large_file_input === "true") {
        large_file = true;
        if (!api_id_input || Number(api_id_input) <= 0) {
            core.setFailed("api_id cannot be empty");
            process.exit();
        } else {
            api_id = Number(api_id_input);
        }
        if (!api_hash) {
            core.setFailed("api_hash cannot be empty");
            process.exit();
        }
    } else {
        large_file = false;
    }
    
    if (cache_session_input === "false") {
        cache_session = false;
    } else {
        cache_session = true;
    }
    
    return {
        bot_token,
        chat_id,
        context,
        path,
        parse_mode,
        method,
        large_file,
        api_id,
        api_hash: api_hash || null,
        topic_id,
        cache_session,
        session
    };
}