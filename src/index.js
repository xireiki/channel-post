const fs = require("fs");
const os = require("os");
const core = require("@actions/core");
const github = require("@actions/github");
const TelegramBot = require("node-telegram-bot-api");
const { glob, globSync } = require('glob');
const { exec } = require('child_process');
const request = require("request");

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

function getFiles(path){
	const finalPaths = [];
	try {
		fs.accessSync(path, fs.constants.F_OK);
	} catch(err){
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

function sleep(time){
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

function main(Bot){
	return new Promise((resolve, reject) => {
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
		
		switch(method){
			case "sendDocument":
				sendDocument(Bot, chat_id, path, {
					parse_mode: parse_mode == "" ? undefined : parse_mode,
					caption: context === "" ? undefined : context
				})
					.then(() => {
						resolve();
					})
					.catch(err => {
						reject(err);
					});
				break;
			case "sendPhoto":
				sendPhoto(Bot, chat_id, path, {
					parse_mode: parse_mode == "" ? undefined : parse_mode,
					caption: context === "" ? undefined : context
				})
					.then(() => {
						resolve();
					})
					.catch(err => {
						reject(err);
					});
				break;
			case "sendAudio":
				sendAudio(Bot, chat_id, path, {
					parse_mode: parse_mode == "" ? undefined : parse_mode,
					caption: context === "" ? undefined : context
				})
					.then(() => {
						resolve();
					})
					.catch(err => {
						reject(err);
					});
				break;
			case "sendVideo":
				sendVideo(Bot, chat_id, path, {
					parse_mode: parse_mode == "" ? undefined : parse_mode,
					caption: context === "" ? undefined : context
				})
					.then(() => {
						resolve();
					})
					.catch(err => {
						reject(err);
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
						caption: Array.isArray(context) ? context[m] : undefined,
						parse_mode: parse_mode == "" ? undefined : parse_mode,
					});
				}
				if(typeof context === "string" && context != ""){
					media[media.length - 1].caption = context;
				}
				sendMediaGroup(Bot, chat_id, media)
					.then(() => {
						resolve();
					})
					.catch(err => {
						reject(err);
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
							caption: Array.isArray(context) ? context[m] : undefined,
							parse_mode: parse_mode == "" ? undefined : parse_mode,
						});
					}
					if(typeof context === "string" && context != ""){
						media[media.length - 1].caption = context;
					}
					sendMediaGroup(Bot, chat_id, media)
						.then(() => {
							resolve();
						})
						.catch(err => {
							reject(err);
						});
				} else {
					sendDocument(Bot, chat_id, path, {
						parse_mode: parse_mode == "" ? undefined : parse_mode,
						caption: context === "" ? undefined : context
					})
						.then(() => {
							resolve();
						})
						.catch(err => {
							reject(err);
						});
				}
				break;
			case "sendMessage":
				sendMessage(Bot, chat_id, context, {
					parse_mode: parse_mode == "" ? undefined : parse_mode
				})
					.then(() => {
						resolve();
					})
					.catch(err => {
						reject(err);
					});
				break;
		}
	});
}

const bot_token = core.getInput("bot_token");
const chat_id = core.getInput("chat_id");
const context = core.getInput("context");
let path = core.getInput("path");
const parse_mode = core.getInput("parse_mode");
const method = core.getInput("method");
const large_file = core.getInput("large_file");
const api_id = core.getInput("api_id");
const api_hash = core.getInput("api_hash");

if(!bot_token){
	core.setFailed("bot_token cannot be empty");
	process.exit();
}
if(!chat_id){
	core.setFailed("chat_id cannot be empty");
	process.exit();
}
if(!method){
	core.setFailed("method cannot be empty");
	process.exit();
}
if(method == "sendMessage"){
	if(!context){
		core.setFailed("context cannot be empty");
		process.exit();
	}
} else {
	if(!path){
		core.setFailed("path cannot be empty");
		process.exit();
	}
}

if(large_file == true || large_file == "true"){
	if(!api_id){
		core.setFailed("api_id cannot be empty");
		process.exit();
	}
	if(!api_hash){
		core.setFailed("api_hash cannot be empty");
		process.exit();
	}
	const arch = os.arch();
	if(arch != "x86_64" && arch != "amd64" && arch != "x86-64" && arch != "x64"){
		core.setFailed("only x86_64 is now supported for large_file. Does not support " + os.arch());
		process.exit();
	}
	let downloadUrl;
	let fileName = "telegram-bot-api";
	let run_cmd = `chmod +x ${fileName} && ./${fileName} --api-id=${api_id} --api-hash=${api_hash} --local`;
	if(process.platform == "linux"){
		downloadUrl = "https://github.com/xireiki/telegram-bot-api-build/releases/download/telegram-bot-api/telegram-bot-api_linux_x86-64";
	} else if(process.platform == "darwin"){
		downloadUrl = "https://github.com/xireiki/telegram-bot-api-build/releases/download/telegram-bot-api/telegram-bot-api_darwin_x86-64";
	} else if(process.platform == "win32"){
		downloadUrl = "https://github.com/xireiki/telegram-bot-api-build/releases/download/telegram-bot-api/telegram-bot-api_win_x86-64.exe";
		fileName = "telegram-bot-api.exe";
		run_cmd = `.\\${fileName} --api-id=${api_id} --api-hash=${api_hash} --local`;
	} else {
		core.setFailed("Unsupported system architecture: " + process.platform);
		process.exit();
	}
	const file = fs.createWriteStream(fileName);
	request(downloadUrl)
		.pipe(file)
		.on("finish", () => {
			file.close();
			sleep(3000).then(() => {
				const child = exec(run_cmd, err => {
					if(err){
						core.setFailed(err.message);
						process.exit();
					}
				});
				child.on('exit', () => {
					child.kill();
				});
				setTimeout(() => {
					const Bot = new TelegramBot(bot_token, {baseApiUrl: "http://127.0.0.1:8081"});
					main(Bot).then(() => {
						child.kill("SIGINT");
						process.exit();
					}).catch(err => {
						core.setFailed(err.message);
						process.exit();
					});
				}, 5000);
			});
		})
		.on("error", err => core.setFailed(err.message));
} else {
	const Bot = new TelegramBot(bot_token);
	main(Bot).then(() => {
		process.exit();
	}).catch(err => {
		core.setFailed(err.message);
		process.exit();
	});
}
