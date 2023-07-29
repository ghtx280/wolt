module.exports = {
  $: (ctx) => $html += ctx,
  $_: (ctx) => ctx,
  $timeout: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  $fetch: {
    json: async (url) => (await fetch(url)).json(),
    text: async (url) => (await fetch(url)).text(),
  },
  $range: (...a) => {
    let b, c, d;
    1 === a.length
      ? ((b = 1), (c = a[0]), (d = 1))
      : 2 === a.length
      ? (([b, c] = a), (d = 1))
      : 3 === a.length && ([b, c, d] = a);
    const e = [];
    for (let f = b; f <= c; f += d) e.push(f);
    return e;
  },
};