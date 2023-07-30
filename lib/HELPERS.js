module.exports = {
  $: (ctx) => $html += ctx,
  $_: (ctx) => ctx,
  $timeout: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  $fetch: {
    json: async (url) => (await fetch(url)).json(),
    text: async (url) => (await fetch(url)).text(),
  },
  $range: (start, end, step = 1) => {
    if (!start && !end) { start = 1;   end = 3   }
    if (start  && !end) { end = start; start = 1 }

    const result = [];
    
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  },
  $random: (min, max, fix = 0) => {
    if (!min && !max) { min = 0;   max = 10 }
    if (min  && !max) { max = min; min = 0  }
    return +(Math.random() * (max - min) + min).toFixed(fix)
  }
};