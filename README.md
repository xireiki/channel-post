# Channel Post
This is a Telegram Channel Post action.

## Inputs
### `bot_token`
**Required**: Your Telegram Bot API Token.

### `chat_id`
**Required**: Your Telegram Chat ID(Like channel)

### `topic_id`
**Optional**: Topic ID. Can be used to send messages on a specific topic, not in #General

### `context`
**Optional**(Except sendMessage): Your Post Context

### `path`
**Required**(Except sendMessage): Your File Path

### `parse_mode`
**Optional**: The following values are available: `HTML`, `MarkdownV2`, `Markdown` or `None`(default, None). 

The syntax of `MarkdownV2` and `Markdown` is different from that of regular `Markdown`. Please check the [Telegram Bot Api](https://core.telegram.org/bots/api#markdownv2-style) documentation.

### `method`
The following values are available:

| Method | Description |
| :----: | :----: |
| sendDocument | (Default)Send File |
| sendPhoto | Send Photo |
| sendAudio | Send Audio |
| sendVideo | Send Video |
| sendMediaGroup | Send Media Files(2-10 media films)，include Document |
| sendFile | Send Files(1-10 files) |
| sendMessage | Send Text |

### `large_file`
**Optional**: Enable large file support, api_id and api_hash are required after enabling

### `api_id`
**Optional**(Except when large_file is true): Telegram Developer api_id

### `api_hash`
**Optional**(Except when large_file is true): Telegram Developer api_hash

### `cache_session`
**Optional**: Save robot session files, default is false.

## Outputs
| Key | Description |
| :----: | :----: |
| msgId | message_id of the sent message |

## Example
```yml
steps:
  # examlple 1
  - uses: xireiki/channel-post@v1
    name: Post File
    with:
      bot_token: ${{ secrets.BOT_TOKEN }}
      chat_id: ${{ secrets.CHAT_ID }}
      context: "An example"
      path: example.zip

  # example 2
  - uses: xireiki/channel-post@v1
    name: Post File
    with:
      bot_token: ${{ secrets.BOT_TOKEN }}
      chat_id: ${{ secrets.CHAT_ID }}
      context: "An <i>example</i>"
      path: example.zip
      parse_mode: HTML # Optional
      method: sendDocument

  # example 3
  - uses: xireiki/channel-post@v1
    name: Post Files
    with:
      bot_token: ${{ secrets.BOT_TOKEN }}
      chat_id: ${{ secrets.CHAT_ID }}
      context: "An example"
      path: *.zip # Total size does not exceed 50M
      parse_mode: None # Optional
      method: sendFile

  # example 4
  - uses: xireiki/channel-post@v1
    name: Post MediaGroup
    with:
      bot_token: ${{ secrets.BOT_TOKEN }}
      chat_id: ${{ secrets.CHAT_ID }}
      context: "An *example*"
      path: |
        test/c.txt
        test/d.zip
      parse_mode: Markdown # Optional
      method: sendMediaGroup

  # example 5
  - uses: xireiki/channel-post@v1
    name: Post Text
    with:
      bot_token: ${{ secrets.BOT_TOKEN }}
      chat_id: ${{ secrets.CHAT_ID }}
      context: "An *example*"
      parse_mode: MarkdownV2 # Optional
      method: sendMessage

  # example 6
  - uses: xireiki/channel-post@v1
    name: Test Post Large File
    with:
      bot_token: ${{ secrets.BOT_TOKEN }}
      chat_id: ${{ secrets.CHAT_ID }}
      context: Test Post Large File
      method: sendFile # sendDocument、sendMediaGroup
      path: **/*.zip # Total size does not exceed 2000M
      large_file: true
      api_id: ${{ secrets.API_ID }} # 12345678
      api_hash: ${{ secrets.API_HASH }} # 01234567890abcdef01234567890abcdef
      # api_server: https://example.com/telegram-bot-api_windows_x86
      # api_server_file_name: telegram-bot-api.exe # default: telegram-bot-api
      # run_cmd: '.\{fileName} --api-id={api_id} --api-hash={api_hash}'
```

# Local operation
The core. GetInput method gets its input through an environment variable, so we can also use it like this(Prefix INPUT_ with parameter name capitalized):
```shell
git clone https://github.com/xireiki/channel-post.git
export INPUT_BOT_TOKEN="${BOT_TOKEN}"
export INPUT_CHAT_ID="${CHAT_ID}"
export INPUT_METHOD=sendFile # Required
export INPUT_PARSE_MODE="None" # Required
export INPUT_CONTEXT="An Example"
export INPUT_PATH="./*.zip" # Total size cannot exceed 50M
node channel-post/dist/bundle.js
```
