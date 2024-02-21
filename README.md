# Channel Post
This is a Telegram Channel Post action.

## Inputs
### `BOT_API`
**Required**: Your Telegram Bot API

### `CHAT_ID`
**Required**: Your Telegram Channel ID

### `CONTEXT`
Your Post Context

### `path`
**Required**: Your File Path

### `PARSE_MODE`
The following values are available: `HTML`、`Markdown` or `""`(default).

### `METHOD`
The following values are available:

| Method | Description |
| :----: | :----: |
| sendDocument | (Default)Send File |
| sendPhoto | Send Photo |
| sendAudio | Send Audio |
| sendVideo | Send Video |
| sendMediaGroup | Send Media Files(2-10 media films)，include Document |
| sendFile | Send Files(1-10 files) |

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
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      CHAT_ID: ${{ secrets.CHAT_ID }}
      CONTEXT: "An example"
      path: example.zip

  # example 2
  - uses: xireiki/channel-post@v1
    name: Post File
    with:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      CHAT_ID: ${{ secrets.CHAT_ID }}
      CONTEXT: "An <i>example</i>"
      path: example.zip
      PARSE_MODE: HTML
      METHOD: sendDocument

  # example 3
  - uses: xireiki/channel-post@v1
    name: Post File
    with:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      CHAT_ID: ${{ secrets.CHAT_ID }}
      CONTEXT: "An example"
      path: *.zip
      PARSE_MODE: None
      METHOD: sendFile

  # example 4
  - uses: xireiki/channel-post@v1
    name: Post MediaGroup
    with:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      CHAT_ID: ${{ secrets.CHAT_ID }}
      CONTEXT: "An **example**"
      path: |
        test/c.txt
        test/d.zip
      PARSE_MODE: Markdown
      METHOD: sendMediaGroup
```
