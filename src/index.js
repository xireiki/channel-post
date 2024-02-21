const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");
const TelegramBot = require("node-telegram-bot-api");
const { glob, globSync } = require('glob');

function _getMediaTelegramType(path){
	const photoType = [
		".jpg", ".png", ".jpeg", ".webp", ".gif"
	]
	const videoType = [
		".mp4", ".flv", ".avi", ".webm", ".mov",
		".rmvb", ".3gp", ".3g2", ".wmv", ".mpeg"
	]
	for(const t of photoType){
		if(path.endsWith(t)){
			return "photo"
		}
	}
	for(const t of videoType){
		if(path.endsWith(t)){
			return "video"
		}
	}
	return "document";
}

function _setOutput(key, value){
	core.setOutput(key, value);
}

function sendDocument(Bot, ChatId, path, option = {}, fileOption = {}){
	if(typeof path != "string" || path.indexOf("\n") >= 0){
		throw new Error("Multiple files are not supported, use sendFile or sendMediaGroup");
	}
	if(!fs.existsSync(path)){
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

function sendPhoto(Bot, ChatId, path, option = {}, fileOption = {}){
	if(typeof path != "string"){
		throw new Error("Multiple files are not supported");
	}
	if(!fs.existsSync(path)){
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

function sendAudio(Bot, ChatId, path, option = {}, fileOption = {}){
	if(typeof path != "string"){
		throw new Error("Multiple files are not supported");
	}
	if(!fs.existsSync(path)){
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

function sendVideo(Bot, ChatId, path, option = {}, fileOption = {}){
	if(typeof path != "string"){
		throw new Error("Multiple files are not supported");
	}
	if(!fs.existsSync(path)){
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

function sendMediaGroup(Bot, ChatId, media){
	if(!Array.isArray(media) || (Array.isArray(media) && (media.length < 2 || media.length > 10))){
		throw new Error("sendMediaGroup requires 2-10 media files");
	}
	for(const path of media){
		if(!fs.existsSync(path["media"])){
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

function sendMessage(Bot, ChatId, Msg, option = {}){
	return Bot.sendMessage(ChatId, Msg, option == {} ? undefined : option)
		.then(result => {
			console.log("Message sent");
			_setOutput("msgId", result["message_id"]);
		})
		.catch(err => {
			throw new Error(err.message);
		});
}

try {
	const BOT_TOKEN = core.getInput("BOT_TOKEN");
	const CHAT_ID = core.getInput("CHAT_ID");
	const CONTEXT = core.getInput("CONTEXT");
	let path = core.getInput("path");
	const PARSE_MODE = core.getInput("PARSE_MODE");
	const METHOD = core.getInput("METHOD");

	const Bot = new TelegramBot(BOT_TOKEN);

	function getFiles(path){
		const finalPaths = [];
		try {
			fs.accessSync(path, fs.constants.F_OK);
		} catch(err){
			console.log(path.indexOf("*"))
			if(path.indexOf("*") >= 0){
				const files = globSync(path)
				files.forEach(file => {
					finalPaths.push(file);
				});
			}
		}
		path = finalPaths.join("\n");
		return path;
	}

	if(path.indexOf("\n") >= 0){
		const paths = path.split("\n");
		for(let i = 0; i < paths.length; i += 1){
			if(path.indexOf("*") >= 0){
				const finalPaths = [];
				paths[i] = getFiles(paths[i]);
			}
		}
		path = paths.join("\n");
	} else if(path.indexOf("*") >= 0){
		path = getFiles(path);
	}

	switch(METHOD){
		case "sendDocument":
			sendDocument(Bot, CHAT_ID, path, {
				parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
				caption: CONTEXT === "" ? undefined : CONTEXT
			})
				.catch(err => {
					core.setFailed(err.message);
				});
			break;
		case "sendPhoto":
			sendPhoto(Bot, CHAT_ID, path, {
				parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
				caption: CONTEXT === "" ? undefined : CONTEXT
			})
				.catch(err => {
					core.setFailed(err.message);
				});
			break;
		case "sendAudio":
			sendAudio(Bot, CHAT_ID, path, {
				parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
				caption: CONTEXT === "" ? undefined : CONTEXT
			})
				.catch(err => {
					core.setFailed(err.message);
				});
			break;
		case "sendVideo":
			sendVideo(Bot, CHAT_ID, path, {
				parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
				caption: CONTEXT === "" ? undefined : CONTEXT
			})
				.catch(err => {
					core.setFailed(err.message);
				});
			break;
		case "sendMediaGroup":
			media = [];
			let paths;
			if(typeof path === "string"){
				paths = path.split("\n");
			} else {
				paths = path;
			}
			for(let m in paths){
				media.push({
					type: _getMediaTelegramType(paths[m]),
					media: paths[m],
					caption: Array.isArray(CONTEXT) ? CONTEXT[m] : undefined,
					parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
				});
			}
			if(typeof CONTEXT === "string" && CONTEXT != ""){
				media[media.length - 1].caption = CONTEXT;
			}
			sendMediaGroup(Bot, CHAT_ID, media)
				.catch(err => {
					core.setFailed(err.message);
				});
			break;
		case "sendFile":
			if(path.indexOf("\n") >= 0){
				media = [];
				let paths;
				if(typeof path === "string"){
					paths = path.split("\n");
				} else {
					paths = path;
				}
				for(let m in paths){
					media.push({
						type: "document",
						media: paths[m],
						caption: Array.isArray(CONTEXT) ? CONTEXT[m] : undefined,
						parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
					});
				}
				if(typeof CONTEXT === "string" && CONTEXT != ""){
					media[media.length - 1].caption = CONTEXT;
				}
				sendMediaGroup(Bot, CHAT_ID, media)
					.catch(err => {
						core.setFailed(err.message);
					});
			} else {
				sendDocument(Bot, CHAT_ID, path, {
					parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
					caption: CONTEXT === "" ? undefined : CONTEXT
				})
					.catch(err => {
						core.setFailed(err.message);
					});
			}
			break;
		case "sendMessage":
			sendMessage(Bot, CHAT_ID, CONTEXT, {
				parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE
			})
				.catch(err => {
					core.setFailed(err.message);
				});
			break;
		default:
			break;
	}
} catch(err) {
	core.setFailed(err.message);
}