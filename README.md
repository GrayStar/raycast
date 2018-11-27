## Next.js Boilerplate

### Initial Setup

1. Make sure you have [Node](https://nodejs.org/en/) installed.
9.10.1 at the time of setup

2. Make sure you have [NPM](https://www.npmjs.com/) installed.
5.6.0 at the time of setup

3. Install dependencies from NPM
`npm install`

4. Available NPM scripts
    - `dev`: Compiles the code, starts the server, and watches for changes.
    - `build`: Compiles the code.
    - `start`: Starts the server.


### Adding a new Page
1. Add a new file in the `pages` directory.

2. Import the `Page` class and have the new class extend it.
```import Page from 'app/components/page';```
```export default class NewPage extends Page {}```

3. Overwrite `get _successState() {}`
```
get _successState() {
    return (
    	<h1>New Page</h1>
    );
}
```

4. Add a route for your new page in `routes.js`.
```routes.add(${path}, ${name of file in pages directory});```


### Using the layout
1. Import the `Main` class.
```import Main from 'app/layouts/main';```

2. Wrap the returned JSX within `_successState` in `<Main>` and pass it a `title` prop.
```
 get _successState() {
    return (
        <Main title='New Page'>
        	<h1>New Page</h1>
        </Main>
    );
}
```

### Using Hashed Statics

1. The static file path can be different depending on whether the page is being rendered on the server or the client. The `page.js` component is responsible for determining this file path in it's constructor. Components that extend `page.js` will have access to this variable as `this.staticFilePath`.

2. Static assets must be imported in order for webpack to add the hash.
```import hashedImage from 'app/static/images/test.png';```

3. Combine the static file path and the hashed image import within the JSX to get the image to render.
```<img src={ `${this.staticFilePath}${hashedImage}` } alt='Static Hashed Image'/>```
