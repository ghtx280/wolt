## wolt.js is a minimalist template engine for Node.js. It allows you to write HTML code directly inside JavaScript.

### Installation

```shell
npm install wolt
```

### Example 
app.js:

```jsx
const { render } = require("wolt");

(async () => {
  let html = await render("index.jsx", {name: "John"});
})()

// <h1>Hello, John!</h1> 
```

using with express.js:
```jsx
const { render } = require("wolt");
const app = require("express")();

app.get("/", async (req, res)=>{
  res.send(await render("index.jsx", {name: "John"}))
})

app.listen(8080);

// <h1>Hello, John!</h1> 
```
Template:

```jsx
// index.jsx

<h1>Hello, {name}!</h1>
```
As you can see, we simply write regular HTML tags inside JS code. Data is substituted via `{...}` placeholders.

### Expression interpolation

Inside `{...}` you can put any JS expression:

```jsx
let add = (a, b) => a + b
<p>some text { add() * 2 } foo baz</p> 
```

### Conditions and loops

Use native syntax:

```jsx
if (user) {
  <h2>My name is {user.name}, I'm {user.age} y.o.</h2>
}

for (const i of arr) {
  <p>item is {i}</p>
}
```

### Multiline text

Wrap text in backticks to split it into multiple lines:

```jsx
<p>
  `Hello, my name is John.
  I live in London.` 
</p>
```

## Helpers

wolt.js includes some handy helpers you can use in templates:

### $html 

Accumulates final HTML output:

```jsx
$html += '<div>';
$html += 'Hello';
$html += '</div>';
```

### $

Alias for $html to append to HTML output:

```jsx
$('<div>');
$('Hello'); 
$('</div>');
```

### $fetch

Makes AJAX requests:

```jsx
let data = await $fetch.json('/api/users');

for(let user of data) {
  <p>{user.name}</p>
}
``` 

### $timeout

Delays execution:

```jsx
$timeout(1000); // wait 1 second

<p>Done!</p>
```
***
## License
WoltJs is released under the MIT License.
