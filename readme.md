## WOLT - minimalist template engine for Node.js.   
### It allows you to write HTML code directly inside JavaScript (like jsx).

### Installation

Starter template (RECOMMENDED): 
```
npm i wolt; npx wolt
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

app.listen(7500);
```
Template:

```jsx
// index.jsx

<h1>Hello, {name}</h1>
```
### Usage
At the heart of `wolt` is a very simple compiler, in short, it converts HTML tags into template string:

```js
`<h1>Hello, ${name}</h1>`
```
You can use `{...}' anywhere in the tags, for example, to make dynamic tag names:

```perl
<{tag}>Hello, {name}</{tag}>
```
Inside `{...}` you can put any JS expression:

```jsx
<p>lorem { foo(5, 6) * 2 } ipsum</p>
```

### JSX 

It is recommended to use jsx files, but it is not necessary, you can use any files, the script only processes plain text.

### Syntax:

Conditions:
```jsx
if (user) {
  <h2>My name is {user.name}</h2>
}
```
Iteration:

```jsx
for (const i of arr) {
  <p>item is {i}</p>
}
```
Function:

```jsx
function foo(cnt) {
  <p>{cnt}</p>
}

foo("hello world")
```
That is, you can use any JS, everything will work:

```jsx
let link_about = (<a href="/about">about</a>)
<p>
  $(link_about)
</p>
```
The HTML needs to be wrapped in (...) to convert to string only. $(...) function that adds to the HTML at this point.

You can pass data to the script with `'% data %'`, only single or double quotes can be used before and after the % signs.
```html
<script>
  alert("'% some_data %'") // `alert("${ some_data }")`
</script>
```
In JSX files syntax is not highlighted inside the script tag, to avoid this you can use special tags.
```jsx
{"script"}
  alert('"% some_data %"') // `alert('${ some_data }')`
{"/script"}
```

### Multiline text

You can transpose tags this way, it won't be an error:
```jsx
<p>
  hello 
</p>
```
But to do something like this, you have to wrap the text in backticks:
```jsx
<p>
  `after`
  <span>hello</span>
  `before`
</p>
```
Backticks do add content to this location, for example this is how you can add a doctype that gives an error in a JSX file:
```jsx
`<!DOCTYPE html>`
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
```
or
```html
<Text>some content</Text>
```

```jsx 
// text.jsx
<h1>{$slot}</h1> // $slot will be replaced to 'some content'
```
#### Update!
Now the slot can be multi-line
```jsx
<inc href="file.jsx">
  multi line
  text
</inc>
```

### Props

You can also pass some parameters to another file.

```jsx
<inc href="user.jsx" name="{user.name}" age="{user.age}"/>
```
or

```jsx
<User name={user.name} age={user.age}/>
// or use shorthand
<User {...user}/>
```

```jsx 
// user.jsx
<h1>My name name is {$prop.name}, I'm {$prop.age} y.o.</h1>
```
#### Update!
There are 2 types of writing props:
- ```jsx
  <inc user_id="user_{id}">
  ```
  Is converted to ``` `user_${id}` ```, which always returns the string
- ```jsx
  <inc user_id={`user_${id}`}>
  ```
  When using this type, you can transfer data of any type



## Helpers

wolt includes some handy helpers you can use in templates:

### $html 

Accumulates final HTML output:

```jsx
$html += (<div>)
$html += 'Hello'
$html += (</div>)
```

### $

Alias for $html to append to HTML output:

```jsx
$(<div>)
$(Hello)
$(</div>)
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

#### Update!
Usually, to split a tag into several lines, back quotes are used
```jsx
<p>
  `multi-line`
</p>
```
But now you can use the $(...) helper
```jsx
$(<div>
  text
  <a href="#{product.hash}">
    link
  </a>
  <span>{some_variable}</span>
  foo baz
</div>)
```
You can also use components inside this helper, the component must be wrapped in {...}
```jsx
$(<div>
  {<inc href="file.jsx" />}
  or
  {<File />}
</div>);
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
index.html
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
