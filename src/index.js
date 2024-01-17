const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");
const TelegramBot = require("node-telegram-bot-api");

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

function sendDocument(Bot, ChatId, path, {parse_mode, caption} = {}){
  if(typeof path != "string"){
    throw new Error("Multiple files are not supported");
  }
  if(!fs.existsSync(path)){
    throw new Error(`File not found: ${path}`);
  }
  return Bot.sendDocument(ChatId, path, {
    caption: caption,
    parse_mode: parse_mode
  })
    .then(() => {
      console.log("File sent");
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
}

try {
  const BOT_TOKEN = core.getInput("BOT_TOKEN");
  const CHAT_ID = core.getInput("CHAT_ID");
  const CONTEXT = core.getInput("CONTEXT");
  const path = core.getInput("path");
  const PARSE_MODE = core.getInput("PARSE_MODE");
  const METHOD = core.getInput("METHOD");

  const Bot = new TelegramBot(BOT_TOKEN);
  
  switch(METHOD){
    case "sendDocument":
      sendDocument(Bot, CHAT_ID, path, {
        parse_mode: PARSE_MODE == "" ? undefined : PARSE_MODE,
        caption: CONTEXT === "" ? undefined : CONTEXT
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
      Bot.sendMediaGroup(CHAT_ID, media)
    default:
      break;
  }
} catch(err) {
  core.setFailed(err.message);
}