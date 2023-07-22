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
let add = (a, b) => a + b;

<p>foo { add(5, 6) * 2 } baz</p> // foo 22 baz
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
You can write any JS, everything will work

### Multiline text

Wrap text in backticks to split it into multiple lines:

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

If it is a `jsx` file and it is located in the `same folder`, then you can use the short version, just the file name with a capital letter.

```jsx
<Product/>
```

### Slot

You can transfer content to another file.

```jsx
<inc href="product.jsx">some content</inc>
// or
<Product>some content</Product>
```

```jsx 
// product.jsx
<h1>{$slot}</h1> // $slot will be replaced to 'some content'
```

### Props

You can also pass some parameters to another file.

```jsx
<inc href="product.jsx" name="{user.name}" age="{user.age}"/>
// or
<Product name={user.name} age={user.age}/>
// or
<Product {...user}/> // to transfer the whole object
```

```jsx 
// product.jsx
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
$timeout(1000); // wait 1 second

<p>Done!</p>
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
