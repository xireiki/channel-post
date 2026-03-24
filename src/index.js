import { getParams } from "./params.js";
import { postClient } from "./client.js";
import { getFiles, getMediaTelegramType, setOutput } from "./utils.js";

const { bot_token, chat_id, context, path, parse_mode, method, large_file, api_id, api_hash, topic_id } = getParams();

const client = new postClient(bot_token, api_id, api_hash, large_file);
client.init().then(async () => {
	if (method == "sendMessage") {
		try {
			const result = await client.sendMessage(chat_id, context, {
				parse_mode: parse_mode == "" ? undefined : parse_mode,
				message_thread_id: topic_id === "" ? undefined : topic_id
			});
			setOutput("msgId", result["message_id"] ?? result["id"]);
			console.log("Message sent");
		} catch (err) {
			console.error(err);
			client.close();
			process.exit(1);
		}
	} else {
		const files = getFiles(path);
		console.log("Files to send:", files);
		switch (method) {
			case "sendDocument":
				try {
					const result = await client.sendDocument(chat_id, files[0], {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", result["message_id"] ?? result["id"]);
					console.log("Document sent");
				} catch (err) {
					console.error(err);
					client.close();
					process.exit(1);
				}
				break;
			case "sendPhoto":
				try {
					const result = await client.sendPhoto(chat_id, path, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", result["message_id"] ?? result["id"]);
					console.log("Photo sent");
				} catch (err) {
					console.error(err);
					client.close();
					process.exit(1);
				}
				break;
			case "sendAudio":
				try {
					const result = await client.sendAudio(chat_id, path, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", result["message_id"] ?? result["id"]);
					console.log("Audio sent");
				} catch (err) {
					console.error(err);
					client.close();
					process.exit(1);
				}
				break;
			case "sendVideo":
				try {
					const result = await client.sendVideo(chat_id, path, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context,
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					setOutput("msgId", result["message_id"] ?? result["id"]);
					console.log("Video sent");
				} catch (err) {
					console.error(err);
					client.close();
					process.exit(1);
				}
				break;
			case "sendMediaGroup":
				try {
					let media = [];
					// Use the already-parsed files array
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
					const result = await client.sendMediaGroup(chat_id, media, {
						message_thread_id: topic_id === "" ? undefined : topic_id
					});
					// Handle both single result and array of results
					let msgId;
					if (Array.isArray(result)) {
						msgId = result[0]["message_id"] ?? result[0]["id"];
					} else {
						msgId = result["message_id"] ?? result["id"];
					}
					setOutput("msgId", msgId);
					console.log("Media group sent");
				} catch (err) {
					console.error(err);
					client.close();
					process.exit(1);
				}
				break;
			case "sendFile":
				try {
					if (files.length > 10) {
						throw new Error("Telegram only supports sending up to 10 files at a time");
					} else if (files.length > 1) {
						let media = [];
						for (let m in files) {
							media.push({
								type: "document",
								media: files[m],
								caption: Array.isArray(context) ? context[m] : undefined,
								parseMode: parse_mode == "" ? undefined : parse_mode.toLowerCase(),
							});
						}
						if (typeof context === "string" && context != "") {
							media[media.length - 1].caption = context;
						}
						const result = await client.sendMediaGroup(chat_id, media, {
							message_thread_id: topic_id === "" ? undefined : topic_id
						});
						// Handle both single result and array of results
						const msgId = Array.isArray(result) 
							? (result[0]["message_id"] ?? result[0]["id"]) 
							: (result["message_id"] ?? result["id"]);
						setOutput("msgId", msgId);
						console.log("Files sent");
					} else {
						const result = await client.sendDocument(chat_id, files[0], {
							parse_mode: parse_mode == "" ? undefined : parse_mode,
							caption: context === "" ? undefined : context,
							message_thread_id: topic_id === "" ? undefined : topic_id
						});
						setOutput("msgId", result["message_id"] ?? result["id"]);
						console.log("File sent");
					}
				} catch (err) {
					console.error(err);
					client.close();
					process.exit(1);
				}
				break;
		}
	}
}).catch(err => {
	console.error(err);
	process.exit(1);
}).finally(() => {
	client.close();
	console.log("Done");
	process.exit();
});