import * as core from "@actions/core";

export function getParams() {
    const bot_token = core.getInput("bot_token");
    const chat_id = core.getInput("chat_id");
    const context = core.getInput("context");
    let path = core.getInput("path");
    const parse_mode = core.getInput("parse_mode");
    const method = core.getInput("method");
    let large_file = core.getInput("large_file");
    let api_id = core.getInput("api_id");
    const api_hash = core.getInput("api_hash");
    const topic_id = core.getInput("topic_id");
    let cache_session = core.getInput("cache_session");

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

    if (large_file === true || large_file === "true") {
        large_file = true;
        if (!api_id || api_id <= 0) {
            core.setFailed("api_id cannot be empty");
            process.exit();
        } else {
            api_id = Number(api_id);
        }
        if (!api_hash) {
            core.setFailed("api_hash cannot be empty");
            process.exit();
        }
    } else {
        large_file = false;
    }
    // 处理 cache_session 布尔值
    if (cache_session === false || cache_session === "false") {
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
        api_hash,
        topic_id,
        cache_session
    };
}