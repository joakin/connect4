
CONNECT 4
=========

Simple web connect4 game. 2 players playing on the same screen.

Developed using npm and browserify for modules.

Tested on latest FF, Chrome, Mobile FF, Mobile Chrome.

### Deps

```
npm install -g browserify watchify uglify-js
npm install
```

### Usage

Building:

* Do `npm run build` to build the js.
* Open index.html to play.

Testing:

* Do `npm test` to build and test

* Do `npm test-js` to build standalone browser tests. Open public/test.html on
  the browser and look at the console output.

In dev:

* Do `npm run watch` to continuously build the js.
* Do `npm run watch-test` to watch, build and execute tests continuously

For relase:

* Do `npm run dist` to get the optimized build in the `dist/` folder.

### Code

#### Structure

    .
    ├── package.json               # Package manifest
    ├── node_modules               # Dependencies
    ├── dist                       # Release version. Minified and published.
    ├── public                     # Development folder with the app/site
    │   ├── css
    │   │   └── index.css
    │   ├── index.html             # App html
    │   ├── js
    │   │   └── bundle.js          # App js generated by browserify
    │   ├── test-bundle.js         # Test js generated by browserify
    │   └── test.html              # Test html (browser app testing)
    ├── src                        # Application source (js / views)
    │   ├── game                   # Game logic
    │   │   ├── board.js
    │   │   ├── index.js
    │   │   └── player.js
    │   ├── index.js               # Application entry point
    │   ├── ui                     # Game DOM UI
    │   │   ├── game-over.js
    │   │   ├── game.js
    │   │   ├── index.js
    │   │   ├── initial.js
    │   │   └── views              # Pure HTML views
    │   │       ├── game-over.html
    │   │       ├── game.html
    │   │       └── initial.html
    │   └── utils
    │       └── clone.js
    └── test                       # Application tests
        ├── board.js
        ├── clone.js
        ├── game
        ├── game.js
        ├── index.js
        └── utils

#### Technologies

The app is bundled with browserify to get real modules. Source lives in `src`
and gets compiled to the folder, depending on dev or prod.

Besides that, npm is used for dependency management, domify and brfs
(browserify transform) are used to get the views (from html file, to inline str
in the javascript files, to dom nodes).

Plain css is used for the styles.

