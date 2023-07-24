## WOLT - minimalist template engine for Node.js.   
### It allows you to write HTML code directly inside JavaScript (like jsx).

### Installation

Starter template (RECOMMENDED): 
```shell
npm i wolt; npx wolt@latest
```
or just wolt package
```shell
npm i wolt
```

### Example 

using with express.js:
```jsx
// app.js

const { render } = require("wolt");
const app = require("express")();

app.get("/", async (req, res)=>{
  const html = await render("index.jsx", {name: "John"})
  res.send(html)
})

app.listen(8080);
```
Template:

```jsx
// index.jsx

<h1>Hello, {name}</h1>
```
As you can see, we simply write regular HTML tags inside JS code. Data is substituted via `{...}` placeholders.

### Expression interpolation

Inside `{...}` you can put any JS expression:

```jsx
let add = (a, b) => a + b;

<p>foo { add(5, 6) * 2 } baz</p> // foo 22 baz
```

### Conditions, loops and other

Use native syntax:

```jsx
// conditions
if (user) {
  <h2>My name is {user.name}, I'm {user.age} y.o.</h2>
}

// loop
for (const i of arr) {
  <p>item is {i}</p>
}

// funtion
function foo(cnt) {
  <p>{cnt}</p>
}
foo("hello")
foo("world")

// using variables
let link_about = (<a href="/about">about</a>) // html needs to be wrapped in (...) to convert to string only
<p>
  $(link_about) // $(...) will replace and add to the main html 
</p>

```
You can write any JS, everything will work

### Multiline text

You cannot simply move the tag content to a new line because the script processes the code line by line:
```jsx
<p>
  hello 
</p>
// hello is not defined
```
To make multiline content, wrap your content in backticks:
```jsx
<p>
  `Hello, my name is {user.name}.
  I live in {user.city}.` 
</p>
```

## Components

You can use the special `<inc>` tag to insert code from another file.

```jsx
<inc href="product.jsx"/>
```

If it is a `jsx` file and it is located in the same folder, then you can use the short version, just the file name with a capital letter (the file itself should be lowercase, like `product.jsx`).

```jsx
<Product/>
```

### Slot

You can transfer content to another file.

```html
<inc href="text.jsx">some content</inc>
// or
<Text>some content</Text>
```

```jsx 
// text.jsx
<h1>{$slot}</h1> // $slot will be replaced to 'some content'
```

### Props

You can also pass some parameters to another file.

```jsx
<inc href="user.jsx" name="{user.name}" age="{user.age}"/>
// or
<User name={user.name} age={user.age}/>
// or
<User {...user}/> // to transfer the whole object
```

```jsx 
// User.jsx
<h1>My name name is {$prop.name}, I'm {$prop.age} y.o.</h1>
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
await $timeout(1000); // wait 1 second

<p>Done!</p>
```
***
## Using router
Wolt has a router based on expressjs.   
To use it, first install expressjs `npm i express`.    
You also need to have a special structure.
```
pages
├─ index.jsx
├─ about.jsx
└─ user.jsx  
app.html
app.js
```

There must be 1 `index.html` file, it is a wrapper for pages (`pages/*`), it contains an inc tag with a special key `$page`, it will be replaced with the desired page.
```html
<html>
  <head></head>
  <body>
    <inc href="pages/$page"/>
  </body>
</html
```

Add the following code to `app.js`:
```js
const { router } = require('wolt');
const app = require('express')();

router(app, {
  "/": function(req, res) {
    return { page: "index.jsx" }
  },
  "/about": function(req, res) {
    return { page: "about.jsx", data: { cnt: "about page" } }
  },
  "/user/:id": function(req, res) {
    return { page: "user.jsx" }
  }
})

app.listen(8080)
```
Instead of `function(req, res) {...}` you can use string `"index.jsx"`, this entry is recommended if your script does not provide any parameters other than `page: "..."`
```js
router(app, {
  "/": "index.jsx",
  "/about": "about.jsx",
  "/user/:id": "user.jsx"
})
```

When using a router, you have access to additional helpers:

- $page - the page you passed in the object, for example: `"about.jsx"`
- $path - the current url path, for example: `"user/10"`
- $slug - dynamic parameters from the url, for example: `{ id: 10 }`

So you can write some such template in `user.jsx`:

```jsx
let user = await $fetch.json('/api/user/' + $slug.id);

<p>{user.name}</p>
``` 

***
## Client rendering
Server return <script> that render in browser
```jsx
await render(file, data, { mode: "client" });
```
***
## License
WoltJs is released under the MIT License.
