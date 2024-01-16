# Channel Post
This is a Telegram Channel Post action.

## Inputs
### `BOT_API`
**Required**: Your Telegram Bot API

### `CHANNEL_ID`
**Required**: Your Telegram Channel ID

### `CONTEXT`
**Required**: Your Post Context

### `path`
**Required**: Your File Path

## Example
```yml
steps:
  # examlple 1
  - uses: xireiki/channel-post@v1
    name: Post File
    with:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      CHANNEL_ID: ${{ secrets.CHANNEL_ID }}
      CONTEXT: "An example"
      path: example.zip

  # example 2
  - uses: xireiki/channel-post@v1
    name: Post File
    with:
      BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
      CHANNEL_ID: ${{ secrets.CHANNEL_ID }}
      CONTEXT: "An <i>example</i>"
      path: example.zip
      PARSE_MODE: 'HTML'
```
