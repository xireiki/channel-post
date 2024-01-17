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
```
