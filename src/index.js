const fs = require("fs");
const core = require("@actions/core");
const github = require("@actions/github");
const TelegramBot = require("node-telegram-bot-api");

try {
  const BOT_TOKEN = core.getInput("BOT_TOKEN");
  const CHANNEL_ID = core.getInput("CHANNEL_ID");
  const CONTEXT = core.getInput("CONTEXT");
  const path = core.getInput("path");
  const PARSE_MODE = core.getInput("PARSE_MODE");

  const Bot = new TelegramBot(BOT_TOKEN);
  if(typeof path != "string"){
    throw new Error("Multiple files are not supported");
  }
  if(!fs.existsSync(path)){
    throw new Error(`File not found: ${path}`);
  }
  Bot.sendDocument(CHANNEL_ID, path, {
    caption: CONTEXT,
    parse_mode: PARSE_MODE == "" ? null : PARSE_MODE
  })
    .then(() => {
      console.log("File sent");
    })
    .catch(err => {
      throw new Error(err.message);
    });
} catch(err) {
  core.setFailed(err.message);
}