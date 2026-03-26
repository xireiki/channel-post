import { getParams } from "./params.js";
import { postClient } from "./client.js";
import { getFiles, getMediaTelegramType, setOutput } from "./utils.js";
import * as cache from "@actions/cache";
import fs from "fs";
import { CACHE_PATH, CACHE_KEY } from "./types.js";
import { MessageResult, MediaGroupItem } from "./types.js";

const { bot_token, chat_id, context, path: filePath, parse_mode, method, large_file, api_id, api_hash, topic_id, cache_session, session } = getParams();

async function restoreSessionCache(): Promise<void> {
	if (!cache_session) {
		return;
	}
	if (session && session != "") {
		fs.writeFileSync(CACHE_PATH[0], session);
	}
	if (fs.existsSync(CACHE_PATH[0])) {
		return;
	}
	try {
		console.log(`Attempting to restore cache with key: ${CACHE_KEY}`);
		const restoredKey = await cache.restoreCache(CACHE_PATH, CACHE_KEY);
		if (restoredKey) {
			console.log(`Successfully restored cache`);
		}
	} catch (err: any) {
		console.warn("Failed to restore cache:", err.message);
	}
}

async function saveSessionCache(): Promise<void> {
	if (!cache_session || !fs.existsSync(CACHE_PATH[0])) {
		return;
	}
	try {
		if (fs.existsSync(CACHE_PATH[0])) {
			console.log(`Saving cache with key: ${CACHE_KEY}`);
			await cache.saveCache(CACHE_PATH, CACHE_KEY);
			console.log("Cache saved successfully");
		}
	} catch (err: any) {
		console.warn("Failed to save cache:", err.message);
	}
}

const client = new postClient(bot_token, api_id, api_hash, large_file);

(async (): Promise<void> => {
	try {
		await restoreSessionCache();

		await client.init();

		if (method == "sendMessage") {
			const result = await client.sendMessage(chat_id, context as string, {
				parse_mode: parse_mode == "" ? undefined : parse_mode,
				message_thread_id: topic_id === "" ? undefined : topic_id
			});
			setOutput("msgId", (result["message_id"] ?? result["id"])?.toString() || "");
			console.log("Message sent");
		} else {
			const files = getFiles(filePath);
			console.log("Files to send:", files);
			switch (method) {
				case "sendDocument":
					if (files.length === 0) {
						throw new Error("No files found to send");
					}
					const fileToSend = files[0];
					if (!fileToSend) {
						throw new Error("File path is undefined");
					}
					const resultDoc = await client.sendDocument(chat_id, fileToSend, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : (context as string),
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", (resultDoc["message_id"] ?? resultDoc["id"])?.toString() || "");
					console.log("Document sent");
					break;
				case "sendPhoto":
					const resultPhoto = await client.sendPhoto(chat_id, filePath, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : (context as string),
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", (resultPhoto["message_id"] ?? resultPhoto["id"])?.toString() || "");
					console.log("Photo sent");
					break;
				case "sendAudio":
					const resultAudio = await client.sendAudio(chat_id, filePath, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : (context as string),
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", (resultAudio["message_id"] ?? resultAudio["id"])?.toString() || "");
					console.log("Audio sent");
					break;
				case "sendVideo":
					const resultVideo = await client.sendVideo(chat_id, filePath, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : (context as string),
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", (resultVideo["message_id"] ?? resultVideo["id"])?.toString() || "");
					console.log("Video sent");
					break;
				case "sendMediaGroup":
					let media: Array<MediaGroupItem> = [];
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						if (!file) continue;
						media.push({
							type: getMediaTelegramType(file),
							media: file,
							caption: Array.isArray(context) ? context[i] : undefined,
							parseMode: parse_mode == "" ? undefined : parse_mode.toLowerCase(),
						});
					}
					if (typeof context === "string" && context != "") {
						const lastMedia = media[media.length - 1];
						if (lastMedia) {
							lastMedia.caption = context;
						}
					}
					const resultMedia = await client.sendMediaGroup(chat_id, media, {
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					let msgId: number | undefined;
					if (Array.isArray(resultMedia)) {
						const firstResult = resultMedia[0];
						if (firstResult) {
							msgId = firstResult["message_id"] ?? firstResult["id"];
						}
					} else {
						msgId = (resultMedia as MessageResult)["message_id"] ?? (resultMedia as MessageResult)["id"];
					}
					setOutput("msgId", msgId?.toString() || "");
					console.log("Media group sent");
					break;
				case "sendFile":
					if (files.length > 10) {
						throw new Error("Telegram only supports sending up to 10 files at a time");
					} else if (files.length > 1) {
						let mediaGroup: Array<MediaGroupItem> = [];
						for (let m = 0; m < files.length; m++) {
							const file = files[m];
							if (!file) continue;
							mediaGroup.push({
								type: "document",
								media: file,
								caption: Array.isArray(context) ? context[m] : undefined,
								parseMode: parse_mode == "" ? undefined : parse_mode.toLowerCase(),
							});
						}
						if (typeof context === "string" && context != "") {
							const lastMedia = mediaGroup[mediaGroup.length - 1];
							if (lastMedia) {
								lastMedia.caption = context;
							}
						}
						const resultFile = await client.sendMediaGroup(chat_id, mediaGroup, {
							message_thread_id: topic_id === "" ? undefined : topic_id
						});
						let fileMsgId: number | undefined;
						if (Array.isArray(resultFile)) {
							const firstResult = resultFile[0];
							if (firstResult) {
								fileMsgId = firstResult["message_id"] ?? firstResult["id"];
							}
						} else {
							fileMsgId = (resultFile as MessageResult)["message_id"] ?? (resultFile as MessageResult)["id"];
						}
						setOutput("msgId", fileMsgId?.toString() || "");
						console.log("Files sent");
					} else {
						if (files.length === 0) {
							throw new Error("No files found to send");
						}
						const singleFile = files[0];
						if (!singleFile) {
							throw new Error("File path is undefined");
						}
						const resultSingleFile = await client.sendDocument(chat_id, singleFile, {
							parse_mode: parse_mode == "" ? undefined : parse_mode,
							caption: context === "" ? undefined : (context as string),
							message_thread_id: topic_id === "" ? undefined : topic_id
						});
						setOutput("msgId", (resultSingleFile["message_id"] ?? resultSingleFile["id"])?.toString() || "");
						console.log("File sent");
					}
					break;
				default:
					throw new Error(`Unknown method: ${method}`);
			}
		}

	} catch (err: any) {
		console.error("Error:", err.message);
		process.exit(1);
	} finally {
		client.close();
		await saveSessionCache();
		console.log("Done");
		process.exit();
	}
})();