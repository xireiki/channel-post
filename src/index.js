import { getParams } from "./params.js";
import { postClient } from "./client.js";
import { getFiles, getMediaTelegramType, setOutput } from "./utils.js";
import * as cache from "@actions/cache";
import fs from "fs";

const { bot_token, chat_id, context, path: filePath, parse_mode, method, large_file, api_id, api_hash, topic_id, cache_session } = getParams();

// 缓存配置
const CACHE_PATH = ["bot.session"];
const CACHE_KEY = `session-${bot_token.split(":")[0]}`;

// 缓存恢复函数
async function restoreSessionCache() {
	if (!cache_session) {
		console.log("Session caching disabled");
		return;
	}
	try {
		console.log(`Attempting to restore cache with key: ${CACHE_KEY}`);
		const restoredKey = await cache.restoreCache(CACHE_PATH, CACHE_KEY);
		if (restoredKey) {
			console.log(`Successfully restored cache`);
		}
	} catch (err) {
		console.warn("Failed to restore cache:", err.message);
	}
}

async function saveSessionCache() {
	if (!cache_session || !fs.existsSync("bot.session")) {
		console.log("Session caching disabled or bot.session not found, skipping cache save");
		return;
	}
	try {
		if (fs.existsSync("bot.session")) {
			console.log(`Saving cache with key: ${CACHE_KEY}`);
			await cache.saveCache(CACHE_PATH, CACHE_KEY);
			console.log("Cache saved successfully");
		}
	} catch (err) {
		console.warn("Failed to save cache:", err.message);
	}
}

const client = new postClient(bot_token, api_id, api_hash, large_file);

// 主函数
(async () => {
	try {
		// 恢复缓存
		await restoreSessionCache();

		// 初始化 client
		await client.init();

		if (method == "sendMessage") {
			const result = await client.sendMessage(chat_id, context, {
				parse_mode: parse_mode == "" ? undefined : parse_mode,
				message_thread_id: topic_id === "" ? undefined : topic_id
			});
			setOutput("msgId", result["message_id"] ?? result["id"]);
			console.log("Message sent");
		} else {
			const files = getFiles(filePath);
			console.log("Files to send:", files);
			switch (method) {
				case "sendDocument":
					const resultDoc = await client.sendDocument(chat_id, files[0], {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", resultDoc["message_id"] ?? resultDoc["id"]);
					console.log("Document sent");
					break;
				case "sendPhoto":
					const resultPhoto = await client.sendPhoto(chat_id, filePath, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", resultPhoto["message_id"] ?? resultPhoto["id"]);
					console.log("Photo sent");
					break;
				case "sendAudio":
					const resultAudio = await client.sendAudio(chat_id, filePath, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", resultAudio["message_id"] ?? resultAudio["id"]);
					console.log("Audio sent");
					break;
				case "sendVideo":
					const resultVideo = await client.sendVideo(chat_id, filePath, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", resultVideo["message_id"] ?? resultVideo["id"]);
					console.log("Video sent");
					break;
				case "sendMediaGroup":
					let media = [];
					for (let i = 0; i < files.length; i++) {
						media.push({
							type: getMediaTelegramType(files[i]),
							media: files[i],
							caption: Array.isArray(context) ? context[i] : undefined,
							parseMode: parse_mode == "" ? undefined : parse_mode.toLowerCase(),
						});
					}
					if (typeof context === "string" && context != "") {
						media[media.length - 1].caption = context;
					}
					const resultMedia = await client.sendMediaGroup(chat_id, media, {
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					let msgId;
					if (Array.isArray(resultMedia)) {
						msgId = resultMedia[0]["message_id"] ?? resultMedia[0]["id"];
					} else {
						msgId = resultMedia["message_id"] ?? resultMedia["id"];
					}
					setOutput("msgId", msgId);
					console.log("Media group sent");
					break;
				case "sendFile":
					if (files.length > 10) {
						throw new Error("Telegram only supports sending up to 10 files at a time");
					} else if (files.length > 1) {
						let mediaGroup = [];
						for (let m in files) {
							mediaGroup.push({
								type: "document",
								media: files[m],
								caption: Array.isArray(context) ? context[m] : undefined,
								parseMode: parse_mode == "" ? undefined : parse_mode.toLowerCase(),
							});
						}
						if (typeof context === "string" && context != "") {
							mediaGroup[mediaGroup.length - 1].caption = context;
						}
						const resultFile = await client.sendMediaGroup(chat_id, mediaGroup, {
							message_thread_id: topic_id === "" ? undefined : topic_id
						});
						const fileMsgId = Array.isArray(resultFile) 
							? (resultFile[0]["message_id"] ?? resultFile[0]["id"]) 
							: (resultFile["message_id"] ?? resultFile["id"]);
						setOutput("msgId", fileMsgId);
						console.log("Files sent");
					} else {
						const resultSingleFile = await client.sendDocument(chat_id, files[0], {
							parse_mode: parse_mode == "" ? undefined : parse_mode,
							caption: context === "" ? undefined : context,
							message_thread_id: topic_id === "" ? undefined : topic_id
						});
						setOutput("msgId", resultSingleFile["message_id"] ?? resultSingleFile["id"]);
						console.log("File sent");
					}
					break;
			}
		}

		await saveSessionCache();

	} catch (err) {
		console.error("Error:", err.message);
		process.exit(1);
	} finally {
		client.close();
		console.log("Done");
		process.exit();
	}
})();