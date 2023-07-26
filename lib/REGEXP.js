module.exports = {
  COMPS: /<(inc|[A-Z]\w+)\s*(.*?)\s*\/?>(?:(.+?)<\/\1>)?;?/gs ,

  STYLE: /<style.*?>[\s\S]*?<\/style>/g ,

  SCRIPT: /((?:<|{["'])script.*?(?:>|["']}))(.*?)((?:<|{["'])\/script(?:>|["']}))/gs ,

  BACKTICKS: /^\s*`\s*([\S\s]+?)\s*`\s*$/gm ,

  TAGS: /\\?<.+>|\\?<[\S\s]+?>$/gm ,
}