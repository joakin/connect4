(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jkn/dev/projects/connect4/node_modules/dom-delegate/lib/delegate.js":[function(require,module,exports){
/*jshint browser:true, node:true*/

'use strict';

module.exports = Delegate;

/**
 * DOM event delegator
 *
 * The delegator will listen
 * for events that bubble up
 * to the root node.
 *
 * @constructor
 * @param {Node|string} [root] The root node or a selector string matching the root node
 */
function Delegate(root) {

  /**
   * Maintain a map of listener
   * lists, keyed by event name.
   *
   * @type Object
   */
  this.listenerMap = [{}, {}];
  if (root) {
    this.root(root);
  }

  /** @type function() */
  this.handle = Delegate.prototype.handle.bind(this);
}

/**
 * Start listening for events
 * on the provided DOM element
 *
 * @param  {Node|string} [root] The root node or a selector string matching the root node
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.root = function(root) {
  var listenerMap = this.listenerMap;
  var eventType;

  // Remove master event listeners
  if (this.rootElement) {
    for (eventType in listenerMap[1]) {
      if (listenerMap[1].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, true);
      }
    }
    for (eventType in listenerMap[0]) {
      if (listenerMap[0].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, false);
      }
    }
  }

  // If no root or root is not
  // a dom node, then remove internal
  // root reference and exit here
  if (!root || !root.addEventListener) {
    if (this.rootElement) {
      delete this.rootElement;
    }
    return this;
  }

  /**
   * The root node at which
   * listeners are attached.
   *
   * @type Node
   */
  this.rootElement = root;

  // Set up master event listeners
  for (eventType in listenerMap[1]) {
    if (listenerMap[1].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, true);
    }
  }
  for (eventType in listenerMap[0]) {
    if (listenerMap[0].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, false);
    }
  }

  return this;
};

/**
 * @param {string} eventType
 * @returns boolean
 */
Delegate.prototype.captureForType = function(eventType) {
  return ['blur', 'error', 'focus', 'load', 'resize', 'scroll'].indexOf(eventType) !== -1;
};

/**
 * Attach a handler to one
 * event for all elements
 * that match the selector,
 * now or in the future
 *
 * The handler function receives
 * three arguments: the DOM event
 * object, the node that matched
 * the selector while the event
 * was bubbling and a reference
 * to itself. Within the handler,
 * 'this' is equal to the second
 * argument.
 *
 * The node that actually received
 * the event can be accessed via
 * 'event.target'.
 *
 * @param {string} eventType Listen for these events
 * @param {string|undefined} selector Only handle events on elements matching this selector, if undefined match root element
 * @param {function()} handler Handler function - event data passed here will be in event.data
 * @param {Object} [eventData] Data to pass in event.data
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.on = function(eventType, selector, handler, useCapture) {
  var root, listenerMap, matcher, matcherParam;

  if (!eventType) {
    throw new TypeError('Invalid event type: ' + eventType);
  }

  // handler can be passed as
  // the second or third argument
  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // Fallback to sensible defaults
  // if useCapture not set
  if (useCapture === undefined) {
    useCapture = this.captureForType(eventType);
  }

  if (typeof handler !== 'function') {
    throw new TypeError('Handler must be a type of Function');
  }

  root = this.rootElement;
  listenerMap = this.listenerMap[useCapture ? 1 : 0];

  // Add master handler for type if not created yet
  if (!listenerMap[eventType]) {
    if (root) {
      root.addEventListener(eventType, this.handle, useCapture);
    }
    listenerMap[eventType] = [];
  }

  if (!selector) {
    matcherParam = null;

    // COMPLEX - matchesRoot needs to have access to
    // this.rootElement, so bind the function to this.
    matcher = matchesRoot.bind(this);

  // Compile a matcher for the given selector
  } else if (/^[a-z]+$/i.test(selector)) {
    matcherParam = selector;
    matcher = matchesTag;
  } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
    matcherParam = selector.slice(1);
    matcher = matchesId;
  } else {
    matcherParam = selector;
    matcher = matches;
  }

  // Add to the list of listeners
  listenerMap[eventType].push({
    selector: selector,
    handler: handler,
    matcher: matcher,
    matcherParam: matcherParam
  });

  return this;
};

/**
 * Remove an event handler
 * for elements that match
 * the selector, forever
 *
 * @param {string} [eventType] Remove handlers for events matching this type, considering the other parameters
 * @param {string} [selector] If this parameter is omitted, only handlers which match the other two will be removed
 * @param {function()} [handler] If this parameter is omitted, only handlers which match the previous two will be removed
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.off = function(eventType, selector, handler, useCapture) {
  var i, listener, listenerMap, listenerList, singleEventType;

  // Handler can be passed as
  // the second or third argument
  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // If useCapture not set, remove
  // all event listeners
  if (useCapture === undefined) {
    this.off(eventType, selector, handler, true);
    this.off(eventType, selector, handler, false);
    return this;
  }

  listenerMap = this.listenerMap[useCapture ? 1 : 0];
  if (!eventType) {
    for (singleEventType in listenerMap) {
      if (listenerMap.hasOwnProperty(singleEventType)) {
        this.off(singleEventType, selector, handler);
      }
    }

    return this;
  }

  listenerList = listenerMap[eventType];
  if (!listenerList || !listenerList.length) {
    return this;
  }

  // Remove only parameter matches
  // if specified
  for (i = listenerList.length - 1; i >= 0; i--) {
    listener = listenerList[i];

    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
      listenerList.splice(i, 1);
    }
  }

  // All listeners removed
  if (!listenerList.length) {
    delete listenerMap[eventType];

    // Remove the main handler
    if (this.rootElement) {
      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
    }
  }

  return this;
};


/**
 * Handle an arbitrary event.
 *
 * @param {Event} event
 */
Delegate.prototype.handle = function(event) {
  var i, l, type = event.type, root, phase, listener, returned, listenerList = [], target, /** @const */ EVENTIGNORE = 'ftLabsDelegateIgnore';

  if (event[EVENTIGNORE] === true) {
    return;
  }

  target = event.target;

  // Hardcode value of Node.TEXT_NODE
  // as not defined in IE8
  if (target.nodeType === 3) {
    target = target.parentNode;
  }

  root = this.rootElement;

  phase = event.eventPhase || ( event.target !== event.currentTarget ? 3 : 2 );
  
  switch (phase) {
    case 1: //Event.CAPTURING_PHASE:
      listenerList = this.listenerMap[1][type];
    break;
    case 2: //Event.AT_TARGET:
      if (this.listenerMap[0] && this.listenerMap[0][type]) listenerList = listenerList.concat(this.listenerMap[0][type]);
      if (this.listenerMap[1] && this.listenerMap[1][type]) listenerList = listenerList.concat(this.listenerMap[1][type]);
    break;
    case 3: //Event.BUBBLING_PHASE:
      listenerList = this.listenerMap[0][type];
    break;
  }

  // Need to continuously check
  // that the specific list is
  // still populated in case one
  // of the callbacks actually
  // causes the list to be destroyed.
  l = listenerList.length;
  while (target && l) {
    for (i = 0; i < l; i++) {
      listener = listenerList[i];

      // Bail from this loop if
      // the length changed and
      // no more listeners are
      // defined between i and l.
      if (!listener) {
        break;
      }

      // Check for match and fire
      // the event if there's one
      //
      // TODO:MCG:20120117: Need a way
      // to check if event#stopImmediatePropagation
      // was called. If so, break both loops.
      if (listener.matcher.call(target, listener.matcherParam, target)) {
        returned = this.fire(event, target, listener);
      }

      // Stop propagation to subsequent
      // callbacks if the callback returned
      // false
      if (returned === false) {
        event[EVENTIGNORE] = true;
        event.preventDefault();
        return;
      }
    }

    // TODO:MCG:20120117: Need a way to
    // check if event#stopPropagation
    // was called. If so, break looping
    // through the DOM. Stop if the
    // delegation root has been reached
    if (target === root) {
      break;
    }

    l = listenerList.length;
    target = target.parentElement;
  }
};

/**
 * Fire a listener on a target.
 *
 * @param {Event} event
 * @param {Node} target
 * @param {Object} listener
 * @returns {boolean}
 */
Delegate.prototype.fire = function(event, target, listener) {
  return listener.handler.call(target, event, target);
};

/**
 * Check whether an element
 * matches a generic selector.
 *
 * @type function()
 * @param {string} selector A CSS selector
 */
var matches = (function(el) {
  if (!el) return;
  var p = el.prototype;
  return (p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector);
}(Element));

/**
 * Check whether an element
 * matches a tag selector.
 *
 * Tags are NOT case-sensitive,
 * except in XML (and XML-based
 * languages such as XHTML).
 *
 * @param {string} tagName The tag name to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesTag(tagName, element) {
  return tagName.toLowerCase() === element.tagName.toLowerCase();
}

/**
 * Check whether an element
 * matches the root.
 *
 * @param {?String} selector In this case this is always passed through as null and not used
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesRoot(selector, element) {
  /*jshint validthis:true*/
  if (this.rootElement === window) return element === document;
  return this.rootElement === element;
}

/**
 * Check whether the ID of
 * the element in 'this'
 * matches the given ID.
 *
 * IDs are case-sensitive.
 *
 * @param {string} id The ID to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesId(id, element) {
  return id === element.id;
}

/**
 * Short hand for off()
 * and root(), ie both
 * with no parameters
 *
 * @return void
 */
Delegate.prototype.destroy = function() {
  this.off();
  this.root();
};

},{}],"/Users/jkn/dev/projects/connect4/node_modules/dom-delegate/lib/index.js":[function(require,module,exports){
/*jshint browser:true, node:true*/

'use strict';

/**
 * @preserve Create and manage a DOM event delegator.
 *
 * @version 0.3.0
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */
var Delegate = require('./delegate');

module.exports = function(root) {
  return new Delegate(root);
};

module.exports.Delegate = Delegate;

},{"./delegate":"/Users/jkn/dev/projects/connect4/node_modules/dom-delegate/lib/delegate.js"}],"/Users/jkn/dev/projects/connect4/node_modules/domify/index.js":[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],"/Users/jkn/dev/projects/connect4/node_modules/domready/ready.js":[function(require,module,exports){
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = /^loaded|^c/.test(doc.readyState)

  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? fn() : fns.push(fn)
  }

});

},{}],"/Users/jkn/dev/projects/connect4/src/game/board.js":[function(require,module,exports){
var clone = require('../utils/clone');

// Board module. Manages the board and its functionality.
// Returns a constructor function as exports, and functions to operate on that
// data structure as exports.fn

// Creates a board of `size`. The cells are a vector of vectors.
// Initializes the board with empty chips.
var Board = module.exports = function(size) {
  var cells = [];
  for (var i = 0; i<size; i++) {
    cells.push([]);
    for (var j = 0; j<size; j++)
      cells[i].push(Board.Chips.EMPTY);
  }
  return {
    size: size,
    cells: cells
  }
};

// Types of chips for the board, constants.
Board.Chips = {
  EMPTY: ' ',
  BLUE: 'O',
  RED: 'X'
};

// Get a specific cell on the board
Board.get = function(row, col, b) {
  return b.cells[row][col];
};

// Set a specific cell on the board
Board.set = function(row, col, val, b) {
  var nb = clone(b);
  nb.cells[row][col] = val;
  return nb;
};

// Put a chip on a column. This is the main function used in the game logic
// when playing. Just receives the col and figures out the row.
Board.put = function(col, val, b) {
  var nb = clone(b);
  for (var i = 0; i < nb.size; i++) {
    var row = nb.cells[i];
    if (row[col] === Board.Chips.EMPTY) {
      row[col] = val;
      return nb;
    }
  }
  throw new Error('Column', col, 'is full in board', b);
};

// Predicate function, true if the board is full, false if it is not
Board.isFull = function(board) {
  var i, j, row;
  for (i = 0; i < board.size; i++)
    for (row = board.cells[i], j = 0; j < board.size; j++)
      if (row[j] === Board.Chips.EMPTY) return false;
  return true;
};

// Returns a function that given an index will tell you if you should check it
// for 4 in line depending on the board size.
function shouldCheck(board) {
  return function(idx) {
    return idx <= board.size - 4;
  };
}

// Detects 4 in line in a board.
// Returns null if there is none.
// Returns { how: TYPE, where: [ROW, COL] } when it finds one.
// Pretty hairy code, but well tested and commented.
Board.hasFourInline = function(board) {

  // Check idx will be used to see if we should try and find 4 in line on
  // a particular index (if it would fit from that index to the board size)
  var checkIdx = shouldCheck(board);

  for (var rowIdx = 0; rowIdx < 7; rowIdx++) {
    var row = board.cells[rowIdx];
    for (var colIdx = 0; colIdx < 7; colIdx++) {

      // We are going to go through every cell in the board, and will try to
      // find 4 different types of 4 in line from the initial cell.
      var currentChip = row[colIdx];
      // For the downwards diagonal we will check from 4 up of the current cell
      // to 4 right of the current cell.
      var iniDownDiag =  checkIdx(rowIdx+3) && board.cells[rowIdx+3][colIdx];

      // We are going to calculate the initial values of the booleans we will
      // use to see if there was 4 in line that particular way.

      // Valid initial cells should not be EMPTY. If empty no 4 in line
      var valValid = true && currentChip !== Board.Chips.EMPTY;
      var downDiagValid = true && iniDownDiag !== Board.Chips.EMPTY;

      // These are the initial values for the different types of 4 in line.
      // For each type of diagonal, the initial value will be if it is possible
      // to have 4 in line there (won't go out of bounds when searching, and
      // the cell has a valid player chip on it)
      var canBeHorizontal = valValid      && checkIdx(colIdx);
      var canBeVertical   = valValid      && checkIdx(rowIdx);
      var canBeUpDiag     = valValid      && checkIdx(rowIdx)  && checkIdx(colIdx);
      var canBeDownDiag   = downDiagValid && checkIdx(rowIdx)  && checkIdx(colIdx);

      var horizontal = canBeHorizontal;
      var vertical   = canBeVertical;
      var updiag     = canBeUpDiag;
      var downdiag   = canBeDownDiag;

      // When there exists the possibility of any 4 in line, go check
      if (canBeHorizontal || canBeVertical || canBeUpDiag || canBeDownDiag) {

        // Lets go through the other 3 cells for each kind of 4 in line and see
        // if they match. We will shortcircuit to false as soon as possible.
        for (var k = 1; k < 4; k++) {

          // For horizontal, we check to the right
          horizontal = horizontal && currentChip === row[colIdx+k];

          // For vertical, we check to the upwards maintaining column
          vertical = vertical && currentChip === board.cells[rowIdx+k][colIdx];

          // For upwards diagonal, we check right and up
          updiag = updiag && currentChip === board.cells[rowIdx+k][colIdx+k];

          // For downwards diagonal, we go from up-left to bottom-right
          downdiag = downdiag && iniDownDiag === board.cells[rowIdx+3-k][colIdx+k];
        }

        // When done checking, we save the position, and see if any of the 4 in
        // lines has matched (true), and return the 4 inline and exit the
        // function
        var how = null;
        var where = [rowIdx, colIdx];
        if (horizontal) how = 'HORIZONTAL';
        if (vertical)   how = 'VERTICAL';
        if (updiag)     how = 'UPDIAGONAL';
        if (downdiag) { how = 'DOWNDIAGONAL'; where = [rowIdx+3, colIdx]; }

        if (how) return { how: how, where: where };
      }
    }
  }
  return null;
};

},{"../utils/clone":"/Users/jkn/dev/projects/connect4/src/utils/clone.js"}],"/Users/jkn/dev/projects/connect4/src/game/index.js":[function(require,module,exports){

var Board = require('./board');
var Player = require('./player');
var clone = require('../utils/clone');

// Game logic module.
// All functions are pure, to get an initial game call `init`.
// All functions return the modified game data structure, they do not modify
// the original game.

// Game states (constants).
// INIT for the initial state waiting for players.
// BLUE and RED are for each players turn to play (imply game started)
// GAMEOVER is when the game is finished
var States = exports.States = {
  INIT: 'INIT',
  BLUE: 'BLUE',
  RED: 'RED',
  GAMEOVER: 'GAMEOVER'
};

// Initialize a game. Leave it in initial state. Next step is `start` with the
// player names.
exports.init = function() {
  return {
    players: { blue: '', red: '' },
    board: Board(7),
    state: States.INIT
  };
};

// Start a game with `player1`, and `player2`.
// Throws if it doesn't come from initial state, or the players are not valid.
// Gives the first turn to the first player.
exports.start = function(player1, player2, game) {
  if (game.state !== States.INIT)
    throw new Error('Can\'t start a game that is not new');
  if (!Player.valid(player1) || !Player.valid(player2))
    throw new Error('Some player names are not valid.', player1, player2);

  var started = clone(game);
  started.players.blue = player1;
  started.players.red = player2;
  started.state = States.BLUE;
  return started;
};

// Make a move. Who moves is determined with the game state, no need to specify
// it.
// Can just be done when game is started (BLUE or RED states).
// After moving, it checks for 4 inlines and returns the win if there were.
// It also checks for full board (not sure if this can happen :s).
// Finally if nothing interesting happened it just changes turn to the other
// player.
exports.play = function(col, game) {
  if (game.state !== States.BLUE && game.state !== States.RED)
    throw new Error('You can only play when the game is running')

  var played = clone(game);
  played.board = Board.put(col, Board.Chips[played.state], played.board);

  var fourInline = Board.hasFourInline(played.board);
  if (fourInline) {
    return win(fourInline, played);
  }

  if (Board.isFull(played.board)) {
    return gameOver(played);
  }

  return switchTurn(played);
};

// Utility function to switch the turn of the player in the game state.
function switchTurn(game) {
  var turn = game.state === States.BLUE ? States.RED : States.BLUE;
  game.state = turn;
  return game;
}

// Puts a game into game over
function gameOver(game) {
  var over = clone(game);
  over.state = States.GAMEOVER;
  return over;
}

// Given a winning 4 in line (like the one from Board.hasFourInline), it puts
// the game into game over and fills the winning information.
function win(fourInline, game) {
  var won = clone(game);
  won.winner = game.state;
  won.state = States.GAMEOVER;
  won.line = fourInline;
  return won;
}

// Utility. Logs a game in a ascii readable way.
exports.print = function(g) {
  console.log(' ', g.state, 'winner:', g.winner,
              'line:', g.line && g.line.how, g.line && g.line.where.join(', '));
  console.log(
    g.board.cells.map(function(r) {
      return [''].concat(r).concat(['']).join('|');
    }).reverse().join('\n')
  );
  console.log(g);
};

function getPlayer(state, game) {
  return game.players[state.toLowerCase()]
}

// Returns the current player's name.
exports.currentPlayer = function(game) {
  return getPlayer(game.state, game);
};

// Returns the winner player's name.
exports.winner = function(game) {
  return getPlayer(game.winner, game);
};

// Returns the looser player's name.
exports.looser = function(game) {
  var w = exports.winner(game);
  return game.players.blue === w ? game.players.red : game.players.blue;
};

},{"../utils/clone":"/Users/jkn/dev/projects/connect4/src/utils/clone.js","./board":"/Users/jkn/dev/projects/connect4/src/game/board.js","./player":"/Users/jkn/dev/projects/connect4/src/game/player.js"}],"/Users/jkn/dev/projects/connect4/src/game/player.js":[function(require,module,exports){

// Validate player name
// * Must be a string
// * Not be empty
exports.valid = function(player) {
  return typeof player === 'string' && player !== '';
};

},{}],"/Users/jkn/dev/projects/connect4/src/index.js":[function(require,module,exports){

// App entry point.
// Just init the UI. At the moment it is the UI who drives the game logic.

var UI = require('./ui');
UI.init('connect4');

},{"./ui":"/Users/jkn/dev/projects/connect4/src/ui/index.js"}],"/Users/jkn/dev/projects/connect4/src/ui/game-over.js":[function(require,module,exports){

var domify = require('domify');


var Connect4 = require('../game');

// HTML template. Browserify inlines file from the fs.readFileSync.
var GameOver = module.exports = {
  screen: domify("<div class='game-over'>\n  <h2>Congratulations <span class='winner'></span></h2>\n  <h4>Maybe next time <span class='looser'></span> :(</h4>\n  <button class='restart'>Try again?</button>\n</div>\n")
};

// Start the screen.
// Attach the template to the dom node. Save references to dom places we need
// to interact with.
// Draw the screen (winner looser)
// Set up events for restarting
GameOver.init = function(ui, restart) {
  ui.dom.appendChild(GameOver.screen.cloneNode(true));

  var screen = {
    winner: ui.dom.querySelector('.winner'),
    looser: ui.dom.querySelector('.looser'),
  };

  screen.winner.textContent = Connect4.winner(ui.game);
  screen.looser.textContent = Connect4.looser(ui.game);

  ui.events.on('click', '.restart', restart.bind(null, ui));

  return screen;
};


},{"../game":"/Users/jkn/dev/projects/connect4/src/game/index.js","domify":"/Users/jkn/dev/projects/connect4/node_modules/domify/index.js"}],"/Users/jkn/dev/projects/connect4/src/ui/game.js":[function(require,module,exports){
var domify = require('domify');


var Connect4 = require('../game');

// HTML template. Browserify inlines file from the fs.readFileSync.
var Game = module.exports = {
  screen: domify("\n<p class='turn'>\nIt is <span></span>'s turn\n</p>\n<div class='board'>\n  <div class='cell'>\n  </div>\n</div>\n<p class='msg'></p>\n")
};

// Start the screen.
// Attach the template to the dom node. Save references to dom places we need
// to interact with.
// Set up events
Game.init = function(ui, play) {
  ui.dom.appendChild(Game.screen.cloneNode(true));

  var screen = {
    // Cell template
    cell: ui.dom.querySelector('.cell'),
    // Whole board
    board: ui.dom.querySelector('.board'),
    // Placeholder for the current player's name
    name: ui.dom.querySelector('.turn>span')
  };

  Game.render(screen, ui);

  // When the user clicks on any cell of the board call the `play` action with
  // the row and column clicked
  ui.events.on('click', '.cell', function(ev, cell) {
    var row = cell.dataset.row;
    var col = cell.dataset.col;
    play(row, col, ui);
  });

  return screen;
};

// Brute force redraws the dom board
Game.drawBoard = function(screen, board) {
  // Clean board
  screen.board.innerHTML = '';

  // Parse game logic cells to dom cells
  var domBoard = board.cells.map(function(row, r) {
    return row.map(cellToDom.bind(null, screen.cell, r));
  });

  // Set the rows and cells in the dom. We need to reverse the rows, or it
  // would be reverse 4 in line.
  domBoard.reverse().forEach(function (row) {
    row.forEach(function (cell) {
      screen.board.appendChild(cell);
    });
  });
};

// Takes a cellDom template, row index, cell value, column index, and creates
// a new cell dom with the row and index as data attributes.
function cellToDom(cellDom, row, cell, col) {
  var nc = cellDom.cloneNode(true);
  nc.dataset.row = row;
  nc.dataset.col = col;
  nc.textContent = cell;
  return nc;
}

// Sets the player name that needs to move in the UI.
Game.drawTurn = function(screen, ui) {
  screen.name.textContent = Connect4.currentPlayer(ui.game);
};

// Render the whole game screen (turn and board)
Game.render = function(screen, ui) {
  Game.drawTurn(screen, ui);
  Game.drawBoard(screen, ui.game.board);
};


},{"../game":"/Users/jkn/dev/projects/connect4/src/game/index.js","domify":"/Users/jkn/dev/projects/connect4/node_modules/domify/index.js"}],"/Users/jkn/dev/projects/connect4/src/ui/index.js":[function(require,module,exports){

// Main dom UI module. Drives a game instance and the view states.

// Dom utilities
var domready = require('domready');
var delegate = require('dom-delegate');

// Game logic
var Connect4 = require('../game');

// Subviews (screens/states)
var Initial = require('./initial');
var Game = require('./game');
var GameOver = require('./game-over');

// Initialize a view given a dom id. It is self driven from there.
exports.init = function(id) {
  domready(function() {

    var dom = document.getElementById(id);

    // UI state, this will be passed through the different steps, and contains
    // the ui and game information.
    var ui = {
      id: id,
      dom: dom,
      game: Connect4.init(), // Game logic instance
      events: delegate(dom), // Delegated events hub
      views: {         // Screens of the UI.
        initial: null, // At the beginning all the steps are non existent.
        game: null,    // We will fill them along the way when we need them.
        gameOver: null
      }
    };

    // Start the initial screen. Give it a callback that will receive the
    // parameters to start the game.
    ui.views.initial = Initial.init(ui, startGame);

  });
}

// Function to be called when we have the blue and red players, and want to
// start the game.
function startGame(blue, red, ui) {
  // It tries to start the game logic. If it fails (state of player
  // validations) then return the error message and stop transitioning
  try {
    ui.game = Connect4.start(blue, red, ui.game);
  } catch (e) {
    return e.message;
  }

  // If the game started successfully transition to the game screen
  cleanScreen(ui);
  // userPlays will be called when the user wants to make a move in the game screen
  ui.views.game = Game.init(ui, userPlays);
}

// Make a movement in the game UI. Moves in the game logic, re-renders the game
// screen to update, and checks if the game has finished.
function userPlays(row, col, ui) {
  ui.game = Connect4.play(col, ui.game);
  Game.render(ui.views.game, ui);
  if (ui.game.state === Connect4.States.GAMEOVER)
    gameFinished(ui);
}

// Game is over. Transition to the game over screen.
// We don't clear the screen because gameOver has css to be an overlay, so that
// we can see the board even though it finished.
function gameFinished(ui) {
  ui.views.gameOver = GameOver.init(ui, restart);
}

// User wants a restart. Clean screen and events and make a brute restart.
function restart(ui) {
  cleanScreen(ui);
  ui.events.off();
  exports.init(ui.id);
}

// Utility function to clean the UI.
function cleanScreen(ui) {
  ui.dom.innerHTML = '';
}


},{"../game":"/Users/jkn/dev/projects/connect4/src/game/index.js","./game":"/Users/jkn/dev/projects/connect4/src/ui/game.js","./game-over":"/Users/jkn/dev/projects/connect4/src/ui/game-over.js","./initial":"/Users/jkn/dev/projects/connect4/src/ui/initial.js","dom-delegate":"/Users/jkn/dev/projects/connect4/node_modules/dom-delegate/lib/index.js","domready":"/Users/jkn/dev/projects/connect4/node_modules/domready/ready.js"}],"/Users/jkn/dev/projects/connect4/src/ui/initial.js":[function(require,module,exports){
var domify = require('domify');


// HTML template. Browserify inlines file from the fs.readFileSync.
var Initial = module.exports = {
  screen: domify("<div class=\"welcome\">\n  <p>Welcome to connect4</p>\n  <p>Choose the name of the players</p>\n</div>\n<div class=\"playerNames\">\n  <input type='text' placeholder='player1' />\n  <input type='text' placeholder='player2' />\n  <button>Start game</button>\n  <span class='msg'></span>\n</div>\n")
};

// Start the screen.
// Attach the template to the dom node. Save references to dom places we need
// to interact with.
// Set up events
Initial.init = function(ui, done) {
  ui.dom.appendChild(Initial.screen.cloneNode(true));

  var screen = {
    // Player names inputs
    inputs: ui.dom.querySelectorAll('.playerNames input'),
    // Error messages placeholder
    msg: ui.dom.querySelector('.playerNames span.msg')
  };

  // Start game button
  ui.events.on('click', '.playerNames button', setPlayers.bind(null, screen, ui, done));
};

// Called to start the game.
// Get the player names and call the callback `done` for starting. If there is
// any error (done returns a str), show the msg.
function setPlayers(screen, ui, done) {
  var blue = screen.inputs[0].value;
  var red = screen.inputs[1].value;
  if (!blue || !red) {
    screen.msg.textContent = 'Every player needs a name!';
    return;
  }

  var res = done(blue, red, ui);
  if (typeof res === 'string')
    screen.msg.textContent = res;
}

},{"domify":"/Users/jkn/dev/projects/connect4/node_modules/domify/index.js"}],"/Users/jkn/dev/projects/connect4/src/utils/clone.js":[function(require,module,exports){

// Utility function to work with immutable data. For now it uses the simplest
// way with JSON.
module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};

},{}]},{},["/Users/jkn/dev/projects/connect4/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0ZS9saWIvZGVsZWdhdGUuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRlL2xpYi9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L25vZGVfbW9kdWxlcy9kb21pZnkvaW5kZXguanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9ub2RlX21vZHVsZXMvZG9tcmVhZHkvcmVhZHkuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9ib2FyZC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL2luZGV4LmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvcGxheWVyLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL3VpL2dhbWUtb3Zlci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91aS9nYW1lLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL3VpL2luZGV4LmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL3VpL2luaXRpYWwuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvdXRpbHMvY2xvbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypqc2hpbnQgYnJvd3Nlcjp0cnVlLCBub2RlOnRydWUqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gRGVsZWdhdGU7XG5cbi8qKlxuICogRE9NIGV2ZW50IGRlbGVnYXRvclxuICpcbiAqIFRoZSBkZWxlZ2F0b3Igd2lsbCBsaXN0ZW5cbiAqIGZvciBldmVudHMgdGhhdCBidWJibGUgdXBcbiAqIHRvIHRoZSByb290IG5vZGUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge05vZGV8c3RyaW5nfSBbcm9vdF0gVGhlIHJvb3Qgbm9kZSBvciBhIHNlbGVjdG9yIHN0cmluZyBtYXRjaGluZyB0aGUgcm9vdCBub2RlXG4gKi9cbmZ1bmN0aW9uIERlbGVnYXRlKHJvb3QpIHtcblxuICAvKipcbiAgICogTWFpbnRhaW4gYSBtYXAgb2YgbGlzdGVuZXJcbiAgICogbGlzdHMsIGtleWVkIGJ5IGV2ZW50IG5hbWUuXG4gICAqXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cbiAgdGhpcy5saXN0ZW5lck1hcCA9IFt7fSwge31dO1xuICBpZiAocm9vdCkge1xuICAgIHRoaXMucm9vdChyb290KTtcbiAgfVxuXG4gIC8qKiBAdHlwZSBmdW5jdGlvbigpICovXG4gIHRoaXMuaGFuZGxlID0gRGVsZWdhdGUucHJvdG90eXBlLmhhbmRsZS5iaW5kKHRoaXMpO1xufVxuXG4vKipcbiAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gKiBvbiB0aGUgcHJvdmlkZWQgRE9NIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0gIHtOb2RlfHN0cmluZ30gW3Jvb3RdIFRoZSByb290IG5vZGUgb3IgYSBzZWxlY3RvciBzdHJpbmcgbWF0Y2hpbmcgdGhlIHJvb3Qgbm9kZVxuICogQHJldHVybnMge0RlbGVnYXRlfSBUaGlzIG1ldGhvZCBpcyBjaGFpbmFibGVcbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLnJvb3QgPSBmdW5jdGlvbihyb290KSB7XG4gIHZhciBsaXN0ZW5lck1hcCA9IHRoaXMubGlzdGVuZXJNYXA7XG4gIHZhciBldmVudFR5cGU7XG5cbiAgLy8gUmVtb3ZlIG1hc3RlciBldmVudCBsaXN0ZW5lcnNcbiAgaWYgKHRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICBmb3IgKGV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcFsxXSkge1xuICAgICAgaWYgKGxpc3RlbmVyTWFwWzFdLmhhc093blByb3BlcnR5KGV2ZW50VHlwZSkpIHtcbiAgICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcFswXSkge1xuICAgICAgaWYgKGxpc3RlbmVyTWFwWzBdLmhhc093blByb3BlcnR5KGV2ZW50VHlwZSkpIHtcbiAgICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBJZiBubyByb290IG9yIHJvb3QgaXMgbm90XG4gIC8vIGEgZG9tIG5vZGUsIHRoZW4gcmVtb3ZlIGludGVybmFsXG4gIC8vIHJvb3QgcmVmZXJlbmNlIGFuZCBleGl0IGhlcmVcbiAgaWYgKCFyb290IHx8ICFyb290LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBpZiAodGhpcy5yb290RWxlbWVudCkge1xuICAgICAgZGVsZXRlIHRoaXMucm9vdEVsZW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSByb290IG5vZGUgYXQgd2hpY2hcbiAgICogbGlzdGVuZXJzIGFyZSBhdHRhY2hlZC5cbiAgICpcbiAgICogQHR5cGUgTm9kZVxuICAgKi9cbiAgdGhpcy5yb290RWxlbWVudCA9IHJvb3Q7XG5cbiAgLy8gU2V0IHVwIG1hc3RlciBldmVudCBsaXN0ZW5lcnNcbiAgZm9yIChldmVudFR5cGUgaW4gbGlzdGVuZXJNYXBbMV0pIHtcbiAgICBpZiAobGlzdGVuZXJNYXBbMV0uaGFzT3duUHJvcGVydHkoZXZlbnRUeXBlKSkge1xuICAgICAgdGhpcy5yb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHRydWUpO1xuICAgIH1cbiAgfVxuICBmb3IgKGV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcFswXSkge1xuICAgIGlmIChsaXN0ZW5lck1hcFswXS5oYXNPd25Qcm9wZXJ0eShldmVudFR5cGUpKSB7XG4gICAgICB0aGlzLnJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCB0aGlzLmhhbmRsZSwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5jYXB0dXJlRm9yVHlwZSA9IGZ1bmN0aW9uKGV2ZW50VHlwZSkge1xuICByZXR1cm4gWydibHVyJywgJ2Vycm9yJywgJ2ZvY3VzJywgJ2xvYWQnLCAncmVzaXplJywgJ3Njcm9sbCddLmluZGV4T2YoZXZlbnRUeXBlKSAhPT0gLTE7XG59O1xuXG4vKipcbiAqIEF0dGFjaCBhIGhhbmRsZXIgdG8gb25lXG4gKiBldmVudCBmb3IgYWxsIGVsZW1lbnRzXG4gKiB0aGF0IG1hdGNoIHRoZSBzZWxlY3RvcixcbiAqIG5vdyBvciBpbiB0aGUgZnV0dXJlXG4gKlxuICogVGhlIGhhbmRsZXIgZnVuY3Rpb24gcmVjZWl2ZXNcbiAqIHRocmVlIGFyZ3VtZW50czogdGhlIERPTSBldmVudFxuICogb2JqZWN0LCB0aGUgbm9kZSB0aGF0IG1hdGNoZWRcbiAqIHRoZSBzZWxlY3RvciB3aGlsZSB0aGUgZXZlbnRcbiAqIHdhcyBidWJibGluZyBhbmQgYSByZWZlcmVuY2VcbiAqIHRvIGl0c2VsZi4gV2l0aGluIHRoZSBoYW5kbGVyLFxuICogJ3RoaXMnIGlzIGVxdWFsIHRvIHRoZSBzZWNvbmRcbiAqIGFyZ3VtZW50LlxuICpcbiAqIFRoZSBub2RlIHRoYXQgYWN0dWFsbHkgcmVjZWl2ZWRcbiAqIHRoZSBldmVudCBjYW4gYmUgYWNjZXNzZWQgdmlhXG4gKiAnZXZlbnQudGFyZ2V0Jy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIExpc3RlbiBmb3IgdGhlc2UgZXZlbnRzXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IHNlbGVjdG9yIE9ubHkgaGFuZGxlIGV2ZW50cyBvbiBlbGVtZW50cyBtYXRjaGluZyB0aGlzIHNlbGVjdG9yLCBpZiB1bmRlZmluZWQgbWF0Y2ggcm9vdCBlbGVtZW50XG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGhhbmRsZXIgSGFuZGxlciBmdW5jdGlvbiAtIGV2ZW50IGRhdGEgcGFzc2VkIGhlcmUgd2lsbCBiZSBpbiBldmVudC5kYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gW2V2ZW50RGF0YV0gRGF0YSB0byBwYXNzIGluIGV2ZW50LmRhdGFcbiAqIEByZXR1cm5zIHtEZWxlZ2F0ZX0gVGhpcyBtZXRob2QgaXMgY2hhaW5hYmxlXG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUpIHtcbiAgdmFyIHJvb3QsIGxpc3RlbmVyTWFwLCBtYXRjaGVyLCBtYXRjaGVyUGFyYW07XG5cbiAgaWYgKCFldmVudFR5cGUpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICB9XG5cbiAgLy8gaGFuZGxlciBjYW4gYmUgcGFzc2VkIGFzXG4gIC8vIHRoZSBzZWNvbmQgb3IgdGhpcmQgYXJndW1lbnRcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHVzZUNhcHR1cmUgPSBoYW5kbGVyO1xuICAgIGhhbmRsZXIgPSBzZWxlY3RvcjtcbiAgICBzZWxlY3RvciA9IG51bGw7XG4gIH1cblxuICAvLyBGYWxsYmFjayB0byBzZW5zaWJsZSBkZWZhdWx0c1xuICAvLyBpZiB1c2VDYXB0dXJlIG5vdCBzZXRcbiAgaWYgKHVzZUNhcHR1cmUgPT09IHVuZGVmaW5lZCkge1xuICAgIHVzZUNhcHR1cmUgPSB0aGlzLmNhcHR1cmVGb3JUeXBlKGV2ZW50VHlwZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdIYW5kbGVyIG11c3QgYmUgYSB0eXBlIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICByb290ID0gdGhpcy5yb290RWxlbWVudDtcbiAgbGlzdGVuZXJNYXAgPSB0aGlzLmxpc3RlbmVyTWFwW3VzZUNhcHR1cmUgPyAxIDogMF07XG5cbiAgLy8gQWRkIG1hc3RlciBoYW5kbGVyIGZvciB0eXBlIGlmIG5vdCBjcmVhdGVkIHlldFxuICBpZiAoIWxpc3RlbmVyTWFwW2V2ZW50VHlwZV0pIHtcbiAgICBpZiAocm9vdCkge1xuICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHVzZUNhcHR1cmUpO1xuICAgIH1cbiAgICBsaXN0ZW5lck1hcFtldmVudFR5cGVdID0gW107XG4gIH1cblxuICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgbWF0Y2hlclBhcmFtID0gbnVsbDtcblxuICAgIC8vIENPTVBMRVggLSBtYXRjaGVzUm9vdCBuZWVkcyB0byBoYXZlIGFjY2VzcyB0b1xuICAgIC8vIHRoaXMucm9vdEVsZW1lbnQsIHNvIGJpbmQgdGhlIGZ1bmN0aW9uIHRvIHRoaXMuXG4gICAgbWF0Y2hlciA9IG1hdGNoZXNSb290LmJpbmQodGhpcyk7XG5cbiAgLy8gQ29tcGlsZSBhIG1hdGNoZXIgZm9yIHRoZSBnaXZlbiBzZWxlY3RvclxuICB9IGVsc2UgaWYgKC9eW2Etel0rJC9pLnRlc3Qoc2VsZWN0b3IpKSB7XG4gICAgbWF0Y2hlclBhcmFtID0gc2VsZWN0b3I7XG4gICAgbWF0Y2hlciA9IG1hdGNoZXNUYWc7XG4gIH0gZWxzZSBpZiAoL14jW2EtejAtOVxcLV9dKyQvaS50ZXN0KHNlbGVjdG9yKSkge1xuICAgIG1hdGNoZXJQYXJhbSA9IHNlbGVjdG9yLnNsaWNlKDEpO1xuICAgIG1hdGNoZXIgPSBtYXRjaGVzSWQ7XG4gIH0gZWxzZSB7XG4gICAgbWF0Y2hlclBhcmFtID0gc2VsZWN0b3I7XG4gICAgbWF0Y2hlciA9IG1hdGNoZXM7XG4gIH1cblxuICAvLyBBZGQgdG8gdGhlIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIGxpc3RlbmVyTWFwW2V2ZW50VHlwZV0ucHVzaCh7XG4gICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgbWF0Y2hlcjogbWF0Y2hlcixcbiAgICBtYXRjaGVyUGFyYW06IG1hdGNoZXJQYXJhbVxuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXJcbiAqIGZvciBlbGVtZW50cyB0aGF0IG1hdGNoXG4gKiB0aGUgc2VsZWN0b3IsIGZvcmV2ZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW2V2ZW50VHlwZV0gUmVtb3ZlIGhhbmRsZXJzIGZvciBldmVudHMgbWF0Y2hpbmcgdGhpcyB0eXBlLCBjb25zaWRlcmluZyB0aGUgb3RoZXIgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtzdHJpbmd9IFtzZWxlY3Rvcl0gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgb21pdHRlZCwgb25seSBoYW5kbGVycyB3aGljaCBtYXRjaCB0aGUgb3RoZXIgdHdvIHdpbGwgYmUgcmVtb3ZlZFxuICogQHBhcmFtIHtmdW5jdGlvbigpfSBbaGFuZGxlcl0gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgb21pdHRlZCwgb25seSBoYW5kbGVycyB3aGljaCBtYXRjaCB0aGUgcHJldmlvdXMgdHdvIHdpbGwgYmUgcmVtb3ZlZFxuICogQHJldHVybnMge0RlbGVnYXRlfSBUaGlzIG1ldGhvZCBpcyBjaGFpbmFibGVcbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUpIHtcbiAgdmFyIGksIGxpc3RlbmVyLCBsaXN0ZW5lck1hcCwgbGlzdGVuZXJMaXN0LCBzaW5nbGVFdmVudFR5cGU7XG5cbiAgLy8gSGFuZGxlciBjYW4gYmUgcGFzc2VkIGFzXG4gIC8vIHRoZSBzZWNvbmQgb3IgdGhpcmQgYXJndW1lbnRcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHVzZUNhcHR1cmUgPSBoYW5kbGVyO1xuICAgIGhhbmRsZXIgPSBzZWxlY3RvcjtcbiAgICBzZWxlY3RvciA9IG51bGw7XG4gIH1cblxuICAvLyBJZiB1c2VDYXB0dXJlIG5vdCBzZXQsIHJlbW92ZVxuICAvLyBhbGwgZXZlbnQgbGlzdGVuZXJzXG4gIGlmICh1c2VDYXB0dXJlID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLm9mZihldmVudFR5cGUsIHNlbGVjdG9yLCBoYW5kbGVyLCB0cnVlKTtcbiAgICB0aGlzLm9mZihldmVudFR5cGUsIHNlbGVjdG9yLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lck1hcCA9IHRoaXMubGlzdGVuZXJNYXBbdXNlQ2FwdHVyZSA/IDEgOiAwXTtcbiAgaWYgKCFldmVudFR5cGUpIHtcbiAgICBmb3IgKHNpbmdsZUV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcCkge1xuICAgICAgaWYgKGxpc3RlbmVyTWFwLmhhc093blByb3BlcnR5KHNpbmdsZUV2ZW50VHlwZSkpIHtcbiAgICAgICAgdGhpcy5vZmYoc2luZ2xlRXZlbnRUeXBlLCBzZWxlY3RvciwgaGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lckxpc3QgPSBsaXN0ZW5lck1hcFtldmVudFR5cGVdO1xuICBpZiAoIWxpc3RlbmVyTGlzdCB8fCAhbGlzdGVuZXJMaXN0Lmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gUmVtb3ZlIG9ubHkgcGFyYW1ldGVyIG1hdGNoZXNcbiAgLy8gaWYgc3BlY2lmaWVkXG4gIGZvciAoaSA9IGxpc3RlbmVyTGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGxpc3RlbmVyID0gbGlzdGVuZXJMaXN0W2ldO1xuXG4gICAgaWYgKCghc2VsZWN0b3IgfHwgc2VsZWN0b3IgPT09IGxpc3RlbmVyLnNlbGVjdG9yKSAmJiAoIWhhbmRsZXIgfHwgaGFuZGxlciA9PT0gbGlzdGVuZXIuaGFuZGxlcikpIHtcbiAgICAgIGxpc3RlbmVyTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWxsIGxpc3RlbmVycyByZW1vdmVkXG4gIGlmICghbGlzdGVuZXJMaXN0Lmxlbmd0aCkge1xuICAgIGRlbGV0ZSBsaXN0ZW5lck1hcFtldmVudFR5cGVdO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBtYWluIGhhbmRsZXJcbiAgICBpZiAodGhpcy5yb290RWxlbWVudCkge1xuICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHVzZUNhcHR1cmUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIEhhbmRsZSBhbiBhcmJpdHJhcnkgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLmhhbmRsZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBpLCBsLCB0eXBlID0gZXZlbnQudHlwZSwgcm9vdCwgcGhhc2UsIGxpc3RlbmVyLCByZXR1cm5lZCwgbGlzdGVuZXJMaXN0ID0gW10sIHRhcmdldCwgLyoqIEBjb25zdCAqLyBFVkVOVElHTk9SRSA9ICdmdExhYnNEZWxlZ2F0ZUlnbm9yZSc7XG5cbiAgaWYgKGV2ZW50W0VWRU5USUdOT1JFXSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcblxuICAvLyBIYXJkY29kZSB2YWx1ZSBvZiBOb2RlLlRFWFRfTk9ERVxuICAvLyBhcyBub3QgZGVmaW5lZCBpbiBJRThcbiAgaWYgKHRhcmdldC5ub2RlVHlwZSA9PT0gMykge1xuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICB9XG5cbiAgcm9vdCA9IHRoaXMucm9vdEVsZW1lbnQ7XG5cbiAgcGhhc2UgPSBldmVudC5ldmVudFBoYXNlIHx8ICggZXZlbnQudGFyZ2V0ICE9PSBldmVudC5jdXJyZW50VGFyZ2V0ID8gMyA6IDIgKTtcbiAgXG4gIHN3aXRjaCAocGhhc2UpIHtcbiAgICBjYXNlIDE6IC8vRXZlbnQuQ0FQVFVSSU5HX1BIQVNFOlxuICAgICAgbGlzdGVuZXJMaXN0ID0gdGhpcy5saXN0ZW5lck1hcFsxXVt0eXBlXTtcbiAgICBicmVhaztcbiAgICBjYXNlIDI6IC8vRXZlbnQuQVRfVEFSR0VUOlxuICAgICAgaWYgKHRoaXMubGlzdGVuZXJNYXBbMF0gJiYgdGhpcy5saXN0ZW5lck1hcFswXVt0eXBlXSkgbGlzdGVuZXJMaXN0ID0gbGlzdGVuZXJMaXN0LmNvbmNhdCh0aGlzLmxpc3RlbmVyTWFwWzBdW3R5cGVdKTtcbiAgICAgIGlmICh0aGlzLmxpc3RlbmVyTWFwWzFdICYmIHRoaXMubGlzdGVuZXJNYXBbMV1bdHlwZV0pIGxpc3RlbmVyTGlzdCA9IGxpc3RlbmVyTGlzdC5jb25jYXQodGhpcy5saXN0ZW5lck1hcFsxXVt0eXBlXSk7XG4gICAgYnJlYWs7XG4gICAgY2FzZSAzOiAvL0V2ZW50LkJVQkJMSU5HX1BIQVNFOlxuICAgICAgbGlzdGVuZXJMaXN0ID0gdGhpcy5saXN0ZW5lck1hcFswXVt0eXBlXTtcbiAgICBicmVhaztcbiAgfVxuXG4gIC8vIE5lZWQgdG8gY29udGludW91c2x5IGNoZWNrXG4gIC8vIHRoYXQgdGhlIHNwZWNpZmljIGxpc3QgaXNcbiAgLy8gc3RpbGwgcG9wdWxhdGVkIGluIGNhc2Ugb25lXG4gIC8vIG9mIHRoZSBjYWxsYmFja3MgYWN0dWFsbHlcbiAgLy8gY2F1c2VzIHRoZSBsaXN0IHRvIGJlIGRlc3Ryb3llZC5cbiAgbCA9IGxpc3RlbmVyTGlzdC5sZW5ndGg7XG4gIHdoaWxlICh0YXJnZXQgJiYgbCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJMaXN0W2ldO1xuXG4gICAgICAvLyBCYWlsIGZyb20gdGhpcyBsb29wIGlmXG4gICAgICAvLyB0aGUgbGVuZ3RoIGNoYW5nZWQgYW5kXG4gICAgICAvLyBubyBtb3JlIGxpc3RlbmVycyBhcmVcbiAgICAgIC8vIGRlZmluZWQgYmV0d2VlbiBpIGFuZCBsLlxuICAgICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgZm9yIG1hdGNoIGFuZCBmaXJlXG4gICAgICAvLyB0aGUgZXZlbnQgaWYgdGhlcmUncyBvbmVcbiAgICAgIC8vXG4gICAgICAvLyBUT0RPOk1DRzoyMDEyMDExNzogTmVlZCBhIHdheVxuICAgICAgLy8gdG8gY2hlY2sgaWYgZXZlbnQjc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXG4gICAgICAvLyB3YXMgY2FsbGVkLiBJZiBzbywgYnJlYWsgYm90aCBsb29wcy5cbiAgICAgIGlmIChsaXN0ZW5lci5tYXRjaGVyLmNhbGwodGFyZ2V0LCBsaXN0ZW5lci5tYXRjaGVyUGFyYW0sIHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuZWQgPSB0aGlzLmZpcmUoZXZlbnQsIHRhcmdldCwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBTdG9wIHByb3BhZ2F0aW9uIHRvIHN1YnNlcXVlbnRcbiAgICAgIC8vIGNhbGxiYWNrcyBpZiB0aGUgY2FsbGJhY2sgcmV0dXJuZWRcbiAgICAgIC8vIGZhbHNlXG4gICAgICBpZiAocmV0dXJuZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIGV2ZW50W0VWRU5USUdOT1JFXSA9IHRydWU7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPOk1DRzoyMDEyMDExNzogTmVlZCBhIHdheSB0b1xuICAgIC8vIGNoZWNrIGlmIGV2ZW50I3N0b3BQcm9wYWdhdGlvblxuICAgIC8vIHdhcyBjYWxsZWQuIElmIHNvLCBicmVhayBsb29waW5nXG4gICAgLy8gdGhyb3VnaCB0aGUgRE9NLiBTdG9wIGlmIHRoZVxuICAgIC8vIGRlbGVnYXRpb24gcm9vdCBoYXMgYmVlbiByZWFjaGVkXG4gICAgaWYgKHRhcmdldCA9PT0gcm9vdCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbCA9IGxpc3RlbmVyTGlzdC5sZW5ndGg7XG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gIH1cbn07XG5cbi8qKlxuICogRmlyZSBhIGxpc3RlbmVyIG9uIGEgdGFyZ2V0LlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihldmVudCwgdGFyZ2V0LCBsaXN0ZW5lcikge1xuICByZXR1cm4gbGlzdGVuZXIuaGFuZGxlci5jYWxsKHRhcmdldCwgZXZlbnQsIHRhcmdldCk7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYW4gZWxlbWVudFxuICogbWF0Y2hlcyBhIGdlbmVyaWMgc2VsZWN0b3IuXG4gKlxuICogQHR5cGUgZnVuY3Rpb24oKVxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIEEgQ1NTIHNlbGVjdG9yXG4gKi9cbnZhciBtYXRjaGVzID0gKGZ1bmN0aW9uKGVsKSB7XG4gIGlmICghZWwpIHJldHVybjtcbiAgdmFyIHAgPSBlbC5wcm90b3R5cGU7XG4gIHJldHVybiAocC5tYXRjaGVzIHx8IHAubWF0Y2hlc1NlbGVjdG9yIHx8IHAud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IHAubW96TWF0Y2hlc1NlbGVjdG9yIHx8IHAubXNNYXRjaGVzU2VsZWN0b3IgfHwgcC5vTWF0Y2hlc1NlbGVjdG9yKTtcbn0oRWxlbWVudCkpO1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYW4gZWxlbWVudFxuICogbWF0Y2hlcyBhIHRhZyBzZWxlY3Rvci5cbiAqXG4gKiBUYWdzIGFyZSBOT1QgY2FzZS1zZW5zaXRpdmUsXG4gKiBleGNlcHQgaW4gWE1MIChhbmQgWE1MLWJhc2VkXG4gKiBsYW5ndWFnZXMgc3VjaCBhcyBYSFRNTCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRhZ05hbWUgVGhlIHRhZyBuYW1lIHRvIHRlc3QgYWdhaW5zdFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHRlc3Qgd2l0aFxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5mdW5jdGlvbiBtYXRjaGVzVGFnKHRhZ05hbWUsIGVsZW1lbnQpIHtcbiAgcmV0dXJuIHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhbiBlbGVtZW50XG4gKiBtYXRjaGVzIHRoZSByb290LlxuICpcbiAqIEBwYXJhbSB7P1N0cmluZ30gc2VsZWN0b3IgSW4gdGhpcyBjYXNlIHRoaXMgaXMgYWx3YXlzIHBhc3NlZCB0aHJvdWdoIGFzIG51bGwgYW5kIG5vdCB1c2VkXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gdGVzdCB3aXRoXG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbmZ1bmN0aW9uIG1hdGNoZXNSb290KHNlbGVjdG9yLCBlbGVtZW50KSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlKi9cbiAgaWYgKHRoaXMucm9vdEVsZW1lbnQgPT09IHdpbmRvdykgcmV0dXJuIGVsZW1lbnQgPT09IGRvY3VtZW50O1xuICByZXR1cm4gdGhpcy5yb290RWxlbWVudCA9PT0gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBJRCBvZlxuICogdGhlIGVsZW1lbnQgaW4gJ3RoaXMnXG4gKiBtYXRjaGVzIHRoZSBnaXZlbiBJRC5cbiAqXG4gKiBJRHMgYXJlIGNhc2Utc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBUaGUgSUQgdG8gdGVzdCBhZ2FpbnN0XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gdGVzdCB3aXRoXG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbmZ1bmN0aW9uIG1hdGNoZXNJZChpZCwgZWxlbWVudCkge1xuICByZXR1cm4gaWQgPT09IGVsZW1lbnQuaWQ7XG59XG5cbi8qKlxuICogU2hvcnQgaGFuZCBmb3Igb2ZmKClcbiAqIGFuZCByb290KCksIGllIGJvdGhcbiAqIHdpdGggbm8gcGFyYW1ldGVyc1xuICpcbiAqIEByZXR1cm4gdm9pZFxuICovXG5EZWxlZ2F0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9mZigpO1xuICB0aGlzLnJvb3QoKTtcbn07XG4iLCIvKmpzaGludCBicm93c2VyOnRydWUsIG5vZGU6dHJ1ZSovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAcHJlc2VydmUgQ3JlYXRlIGFuZCBtYW5hZ2UgYSBET00gZXZlbnQgZGVsZWdhdG9yLlxuICpcbiAqIEB2ZXJzaW9uIDAuMy4wXG4gKiBAY29kaW5nc3RhbmRhcmQgZnRsYWJzLWpzdjJcbiAqIEBjb3B5cmlnaHQgVGhlIEZpbmFuY2lhbCBUaW1lcyBMaW1pdGVkIFtBbGwgUmlnaHRzIFJlc2VydmVkXVxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKHNlZSBMSUNFTlNFLnR4dClcbiAqL1xudmFyIERlbGVnYXRlID0gcmVxdWlyZSgnLi9kZWxlZ2F0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJvb3QpIHtcbiAgcmV0dXJuIG5ldyBEZWxlZ2F0ZShyb290KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLkRlbGVnYXRlID0gRGVsZWdhdGU7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBwYXJzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcblxuLyoqXG4gKiBXcmFwIG1hcCBmcm9tIGpxdWVyeS5cbiAqL1xuXG52YXIgbWFwID0ge1xuICBsZWdlbmQ6IFsxLCAnPGZpZWxkc2V0PicsICc8L2ZpZWxkc2V0PiddLFxuICB0cjogWzIsICc8dGFibGU+PHRib2R5PicsICc8L3Rib2R5PjwvdGFibGU+J10sXG4gIGNvbDogWzIsICc8dGFibGU+PHRib2R5PjwvdGJvZHk+PGNvbGdyb3VwPicsICc8L2NvbGdyb3VwPjwvdGFibGU+J10sXG4gIF9kZWZhdWx0OiBbMCwgJycsICcnXVxufTtcblxubWFwLnRkID1cbm1hcC50aCA9IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddO1xuXG5tYXAub3B0aW9uID1cbm1hcC5vcHRncm91cCA9IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddO1xuXG5tYXAudGhlYWQgPVxubWFwLnRib2R5ID1cbm1hcC5jb2xncm91cCA9XG5tYXAuY2FwdGlvbiA9XG5tYXAudGZvb3QgPSBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXTtcblxubWFwLnRleHQgPVxubWFwLmNpcmNsZSA9XG5tYXAuZWxsaXBzZSA9XG5tYXAubGluZSA9XG5tYXAucGF0aCA9XG5tYXAucG9seWdvbiA9XG5tYXAucG9seWxpbmUgPVxubWFwLnJlY3QgPSBbMSwgJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIj4nLCc8L3N2Zz4nXTtcblxuLyoqXG4gKiBQYXJzZSBgaHRtbGAgYW5kIHJldHVybiBhIERPTSBOb2RlIGluc3RhbmNlLCB3aGljaCBjb3VsZCBiZSBhIFRleHROb2RlLFxuICogSFRNTCBET00gTm9kZSBvZiBzb21lIGtpbmQgKDxkaXY+IGZvciBleGFtcGxlKSwgb3IgYSBEb2N1bWVudEZyYWdtZW50XG4gKiBpbnN0YW5jZSwgZGVwZW5kaW5nIG9uIHRoZSBjb250ZW50cyBvZiB0aGUgYGh0bWxgIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbCAtIEhUTUwgc3RyaW5nIHRvIFwiZG9taWZ5XCJcbiAqIEBwYXJhbSB7RG9jdW1lbnR9IGRvYyAtIFRoZSBgZG9jdW1lbnRgIGluc3RhbmNlIHRvIGNyZWF0ZSB0aGUgTm9kZSBmb3JcbiAqIEByZXR1cm4ge0RPTU5vZGV9IHRoZSBUZXh0Tm9kZSwgRE9NIE5vZGUsIG9yIERvY3VtZW50RnJhZ21lbnQgaW5zdGFuY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKGh0bWwsIGRvYykge1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGh0bWwpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0cmluZyBleHBlY3RlZCcpO1xuXG4gIC8vIGRlZmF1bHQgdG8gdGhlIGdsb2JhbCBgZG9jdW1lbnRgIG9iamVjdFxuICBpZiAoIWRvYykgZG9jID0gZG9jdW1lbnQ7XG5cbiAgLy8gdGFnIG5hbWVcbiAgdmFyIG0gPSAvPChbXFx3Ol0rKS8uZXhlYyhodG1sKTtcbiAgaWYgKCFtKSByZXR1cm4gZG9jLmNyZWF0ZVRleHROb2RlKGh0bWwpO1xuXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTsgLy8gUmVtb3ZlIGxlYWRpbmcvdHJhaWxpbmcgd2hpdGVzcGFjZVxuXG4gIHZhciB0YWcgPSBtWzFdO1xuXG4gIC8vIGJvZHkgc3VwcG9ydFxuICBpZiAodGFnID09ICdib2R5Jykge1xuICAgIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHdyYXAgbWFwXG4gIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLl9kZWZhdWx0O1xuICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICB2YXIgcHJlZml4ID0gd3JhcFsxXTtcbiAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZWwuaW5uZXJIVE1MID0gcHJlZml4ICsgaHRtbCArIHN1ZmZpeDtcbiAgd2hpbGUgKGRlcHRoLS0pIGVsID0gZWwubGFzdENoaWxkO1xuXG4gIC8vIG9uZSBlbGVtZW50XG4gIGlmIChlbC5maXJzdENoaWxkID09IGVsLmxhc3RDaGlsZCkge1xuICAgIHJldHVybiBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHNldmVyYWwgZWxlbWVudHNcbiAgdmFyIGZyYWdtZW50ID0gZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iLCIvKiFcbiAgKiBkb21yZWFkeSAoYykgRHVzdGluIERpYXogMjAxNCAtIExpY2Vuc2UgTUlUXG4gICovXG4hZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24pIHtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJykgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnKSBkZWZpbmUoZGVmaW5pdGlvbilcbiAgZWxzZSB0aGlzW25hbWVdID0gZGVmaW5pdGlvbigpXG5cbn0oJ2RvbXJlYWR5JywgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBmbnMgPSBbXSwgbGlzdGVuZXJcbiAgICAsIGRvYyA9IGRvY3VtZW50XG4gICAgLCBkb21Db250ZW50TG9hZGVkID0gJ0RPTUNvbnRlbnRMb2FkZWQnXG4gICAgLCBsb2FkZWQgPSAvXmxvYWRlZHxeYy8udGVzdChkb2MucmVhZHlTdGF0ZSlcblxuICBpZiAoIWxvYWRlZClcbiAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoZG9tQ29udGVudExvYWRlZCwgbGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoZG9tQ29udGVudExvYWRlZCwgbGlzdGVuZXIpXG4gICAgbG9hZGVkID0gMVxuICAgIHdoaWxlIChsaXN0ZW5lciA9IGZucy5zaGlmdCgpKSBsaXN0ZW5lcigpXG4gIH0pXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChmbikge1xuICAgIGxvYWRlZCA/IGZuKCkgOiBmbnMucHVzaChmbilcbiAgfVxuXG59KTtcbiIsInZhciBjbG9uZSA9IHJlcXVpcmUoJy4uL3V0aWxzL2Nsb25lJyk7XG5cbi8vIEJvYXJkIG1vZHVsZS4gTWFuYWdlcyB0aGUgYm9hcmQgYW5kIGl0cyBmdW5jdGlvbmFsaXR5LlxuLy8gUmV0dXJucyBhIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGFzIGV4cG9ydHMsIGFuZCBmdW5jdGlvbnMgdG8gb3BlcmF0ZSBvbiB0aGF0XG4vLyBkYXRhIHN0cnVjdHVyZSBhcyBleHBvcnRzLmZuXG5cbi8vIENyZWF0ZXMgYSBib2FyZCBvZiBgc2l6ZWAuIFRoZSBjZWxscyBhcmUgYSB2ZWN0b3Igb2YgdmVjdG9ycy5cbi8vIEluaXRpYWxpemVzIHRoZSBib2FyZCB3aXRoIGVtcHR5IGNoaXBzLlxudmFyIEJvYXJkID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzaXplKSB7XG4gIHZhciBjZWxscyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaTxzaXplOyBpKyspIHtcbiAgICBjZWxscy5wdXNoKFtdKTtcbiAgICBmb3IgKHZhciBqID0gMDsgajxzaXplOyBqKyspXG4gICAgICBjZWxsc1tpXS5wdXNoKEJvYXJkLkNoaXBzLkVNUFRZKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNpemU6IHNpemUsXG4gICAgY2VsbHM6IGNlbGxzXG4gIH1cbn07XG5cbi8vIFR5cGVzIG9mIGNoaXBzIGZvciB0aGUgYm9hcmQsIGNvbnN0YW50cy5cbkJvYXJkLkNoaXBzID0ge1xuICBFTVBUWTogJyAnLFxuICBCTFVFOiAnTycsXG4gIFJFRDogJ1gnXG59O1xuXG4vLyBHZXQgYSBzcGVjaWZpYyBjZWxsIG9uIHRoZSBib2FyZFxuQm9hcmQuZ2V0ID0gZnVuY3Rpb24ocm93LCBjb2wsIGIpIHtcbiAgcmV0dXJuIGIuY2VsbHNbcm93XVtjb2xdO1xufTtcblxuLy8gU2V0IGEgc3BlY2lmaWMgY2VsbCBvbiB0aGUgYm9hcmRcbkJvYXJkLnNldCA9IGZ1bmN0aW9uKHJvdywgY29sLCB2YWwsIGIpIHtcbiAgdmFyIG5iID0gY2xvbmUoYik7XG4gIG5iLmNlbGxzW3Jvd11bY29sXSA9IHZhbDtcbiAgcmV0dXJuIG5iO1xufTtcblxuLy8gUHV0IGEgY2hpcCBvbiBhIGNvbHVtbi4gVGhpcyBpcyB0aGUgbWFpbiBmdW5jdGlvbiB1c2VkIGluIHRoZSBnYW1lIGxvZ2ljXG4vLyB3aGVuIHBsYXlpbmcuIEp1c3QgcmVjZWl2ZXMgdGhlIGNvbCBhbmQgZmlndXJlcyBvdXQgdGhlIHJvdy5cbkJvYXJkLnB1dCA9IGZ1bmN0aW9uKGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5iLnNpemU7IGkrKykge1xuICAgIHZhciByb3cgPSBuYi5jZWxsc1tpXTtcbiAgICBpZiAocm93W2NvbF0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSB7XG4gICAgICByb3dbY29sXSA9IHZhbDtcbiAgICAgIHJldHVybiBuYjtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdDb2x1bW4nLCBjb2wsICdpcyBmdWxsIGluIGJvYXJkJywgYik7XG59O1xuXG4vLyBQcmVkaWNhdGUgZnVuY3Rpb24sIHRydWUgaWYgdGhlIGJvYXJkIGlzIGZ1bGwsIGZhbHNlIGlmIGl0IGlzIG5vdFxuQm9hcmQuaXNGdWxsID0gZnVuY3Rpb24oYm9hcmQpIHtcbiAgdmFyIGksIGosIHJvdztcbiAgZm9yIChpID0gMDsgaSA8IGJvYXJkLnNpemU7IGkrKylcbiAgICBmb3IgKHJvdyA9IGJvYXJkLmNlbGxzW2ldLCBqID0gMDsgaiA8IGJvYXJkLnNpemU7IGorKylcbiAgICAgIGlmIChyb3dbal0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufTtcblxuLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgZ2l2ZW4gYW4gaW5kZXggd2lsbCB0ZWxsIHlvdSBpZiB5b3Ugc2hvdWxkIGNoZWNrIGl0XG4vLyBmb3IgNCBpbiBsaW5lIGRlcGVuZGluZyBvbiB0aGUgYm9hcmQgc2l6ZS5cbmZ1bmN0aW9uIHNob3VsZENoZWNrKGJvYXJkKSB7XG4gIHJldHVybiBmdW5jdGlvbihpZHgpIHtcbiAgICByZXR1cm4gaWR4IDw9IGJvYXJkLnNpemUgLSA0O1xuICB9O1xufVxuXG4vLyBEZXRlY3RzIDQgaW4gbGluZSBpbiBhIGJvYXJkLlxuLy8gUmV0dXJucyBudWxsIGlmIHRoZXJlIGlzIG5vbmUuXG4vLyBSZXR1cm5zIHsgaG93OiBUWVBFLCB3aGVyZTogW1JPVywgQ09MXSB9IHdoZW4gaXQgZmluZHMgb25lLlxuLy8gUHJldHR5IGhhaXJ5IGNvZGUsIGJ1dCB3ZWxsIHRlc3RlZCBhbmQgY29tbWVudGVkLlxuQm9hcmQuaGFzRm91cklubGluZSA9IGZ1bmN0aW9uKGJvYXJkKSB7XG5cbiAgLy8gQ2hlY2sgaWR4IHdpbGwgYmUgdXNlZCB0byBzZWUgaWYgd2Ugc2hvdWxkIHRyeSBhbmQgZmluZCA0IGluIGxpbmUgb25cbiAgLy8gYSBwYXJ0aWN1bGFyIGluZGV4IChpZiBpdCB3b3VsZCBmaXQgZnJvbSB0aGF0IGluZGV4IHRvIHRoZSBib2FyZCBzaXplKVxuICB2YXIgY2hlY2tJZHggPSBzaG91bGRDaGVjayhib2FyZCk7XG5cbiAgZm9yICh2YXIgcm93SWR4ID0gMDsgcm93SWR4IDwgNzsgcm93SWR4KyspIHtcbiAgICB2YXIgcm93ID0gYm9hcmQuY2VsbHNbcm93SWR4XTtcbiAgICBmb3IgKHZhciBjb2xJZHggPSAwOyBjb2xJZHggPCA3OyBjb2xJZHgrKykge1xuXG4gICAgICAvLyBXZSBhcmUgZ29pbmcgdG8gZ28gdGhyb3VnaCBldmVyeSBjZWxsIGluIHRoZSBib2FyZCwgYW5kIHdpbGwgdHJ5IHRvXG4gICAgICAvLyBmaW5kIDQgZGlmZmVyZW50IHR5cGVzIG9mIDQgaW4gbGluZSBmcm9tIHRoZSBpbml0aWFsIGNlbGwuXG4gICAgICB2YXIgY3VycmVudENoaXAgPSByb3dbY29sSWR4XTtcbiAgICAgIC8vIEZvciB0aGUgZG93bndhcmRzIGRpYWdvbmFsIHdlIHdpbGwgY2hlY2sgZnJvbSA0IHVwIG9mIHRoZSBjdXJyZW50IGNlbGxcbiAgICAgIC8vIHRvIDQgcmlnaHQgb2YgdGhlIGN1cnJlbnQgY2VsbC5cbiAgICAgIHZhciBpbmlEb3duRGlhZyA9ICBjaGVja0lkeChyb3dJZHgrMykgJiYgYm9hcmQuY2VsbHNbcm93SWR4KzNdW2NvbElkeF07XG5cbiAgICAgIC8vIFdlIGFyZSBnb2luZyB0byBjYWxjdWxhdGUgdGhlIGluaXRpYWwgdmFsdWVzIG9mIHRoZSBib29sZWFucyB3ZSB3aWxsXG4gICAgICAvLyB1c2UgdG8gc2VlIGlmIHRoZXJlIHdhcyA0IGluIGxpbmUgdGhhdCBwYXJ0aWN1bGFyIHdheS5cblxuICAgICAgLy8gVmFsaWQgaW5pdGlhbCBjZWxscyBzaG91bGQgbm90IGJlIEVNUFRZLiBJZiBlbXB0eSBubyA0IGluIGxpbmVcbiAgICAgIHZhciB2YWxWYWxpZCA9IHRydWUgJiYgY3VycmVudENoaXAgIT09IEJvYXJkLkNoaXBzLkVNUFRZO1xuICAgICAgdmFyIGRvd25EaWFnVmFsaWQgPSB0cnVlICYmIGluaURvd25EaWFnICE9PSBCb2FyZC5DaGlwcy5FTVBUWTtcblxuICAgICAgLy8gVGhlc2UgYXJlIHRoZSBpbml0aWFsIHZhbHVlcyBmb3IgdGhlIGRpZmZlcmVudCB0eXBlcyBvZiA0IGluIGxpbmUuXG4gICAgICAvLyBGb3IgZWFjaCB0eXBlIG9mIGRpYWdvbmFsLCB0aGUgaW5pdGlhbCB2YWx1ZSB3aWxsIGJlIGlmIGl0IGlzIHBvc3NpYmxlXG4gICAgICAvLyB0byBoYXZlIDQgaW4gbGluZSB0aGVyZSAod29uJ3QgZ28gb3V0IG9mIGJvdW5kcyB3aGVuIHNlYXJjaGluZywgYW5kXG4gICAgICAvLyB0aGUgY2VsbCBoYXMgYSB2YWxpZCBwbGF5ZXIgY2hpcCBvbiBpdClcbiAgICAgIHZhciBjYW5CZUhvcml6b250YWwgPSB2YWxWYWxpZCAgICAgICYmIGNoZWNrSWR4KGNvbElkeCk7XG4gICAgICB2YXIgY2FuQmVWZXJ0aWNhbCAgID0gdmFsVmFsaWQgICAgICAmJiBjaGVja0lkeChyb3dJZHgpO1xuICAgICAgdmFyIGNhbkJlVXBEaWFnICAgICA9IHZhbFZhbGlkICAgICAgJiYgY2hlY2tJZHgocm93SWR4KSAgJiYgY2hlY2tJZHgoY29sSWR4KTtcbiAgICAgIHZhciBjYW5CZURvd25EaWFnICAgPSBkb3duRGlhZ1ZhbGlkICYmIGNoZWNrSWR4KHJvd0lkeCkgICYmIGNoZWNrSWR4KGNvbElkeCk7XG5cbiAgICAgIHZhciBob3Jpem9udGFsID0gY2FuQmVIb3Jpem9udGFsO1xuICAgICAgdmFyIHZlcnRpY2FsICAgPSBjYW5CZVZlcnRpY2FsO1xuICAgICAgdmFyIHVwZGlhZyAgICAgPSBjYW5CZVVwRGlhZztcbiAgICAgIHZhciBkb3duZGlhZyAgID0gY2FuQmVEb3duRGlhZztcblxuICAgICAgLy8gV2hlbiB0aGVyZSBleGlzdHMgdGhlIHBvc3NpYmlsaXR5IG9mIGFueSA0IGluIGxpbmUsIGdvIGNoZWNrXG4gICAgICBpZiAoY2FuQmVIb3Jpem9udGFsIHx8IGNhbkJlVmVydGljYWwgfHwgY2FuQmVVcERpYWcgfHwgY2FuQmVEb3duRGlhZykge1xuXG4gICAgICAgIC8vIExldHMgZ28gdGhyb3VnaCB0aGUgb3RoZXIgMyBjZWxscyBmb3IgZWFjaCBraW5kIG9mIDQgaW4gbGluZSBhbmQgc2VlXG4gICAgICAgIC8vIGlmIHRoZXkgbWF0Y2guIFdlIHdpbGwgc2hvcnRjaXJjdWl0IHRvIGZhbHNlIGFzIHNvb24gYXMgcG9zc2libGUuXG4gICAgICAgIGZvciAodmFyIGsgPSAxOyBrIDwgNDsgaysrKSB7XG5cbiAgICAgICAgICAvLyBGb3IgaG9yaXpvbnRhbCwgd2UgY2hlY2sgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgaG9yaXpvbnRhbCA9IGhvcml6b250YWwgJiYgY3VycmVudENoaXAgPT09IHJvd1tjb2xJZHgra107XG5cbiAgICAgICAgICAvLyBGb3IgdmVydGljYWwsIHdlIGNoZWNrIHRvIHRoZSB1cHdhcmRzIG1haW50YWluaW5nIGNvbHVtblxuICAgICAgICAgIHZlcnRpY2FsID0gdmVydGljYWwgJiYgY3VycmVudENoaXAgPT09IGJvYXJkLmNlbGxzW3Jvd0lkeCtrXVtjb2xJZHhdO1xuXG4gICAgICAgICAgLy8gRm9yIHVwd2FyZHMgZGlhZ29uYWwsIHdlIGNoZWNrIHJpZ2h0IGFuZCB1cFxuICAgICAgICAgIHVwZGlhZyA9IHVwZGlhZyAmJiBjdXJyZW50Q2hpcCA9PT0gYm9hcmQuY2VsbHNbcm93SWR4K2tdW2NvbElkeCtrXTtcblxuICAgICAgICAgIC8vIEZvciBkb3dud2FyZHMgZGlhZ29uYWwsIHdlIGdvIGZyb20gdXAtbGVmdCB0byBib3R0b20tcmlnaHRcbiAgICAgICAgICBkb3duZGlhZyA9IGRvd25kaWFnICYmIGluaURvd25EaWFnID09PSBib2FyZC5jZWxsc1tyb3dJZHgrMy1rXVtjb2xJZHgra107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXaGVuIGRvbmUgY2hlY2tpbmcsIHdlIHNhdmUgdGhlIHBvc2l0aW9uLCBhbmQgc2VlIGlmIGFueSBvZiB0aGUgNCBpblxuICAgICAgICAvLyBsaW5lcyBoYXMgbWF0Y2hlZCAodHJ1ZSksIGFuZCByZXR1cm4gdGhlIDQgaW5saW5lIGFuZCBleGl0IHRoZVxuICAgICAgICAvLyBmdW5jdGlvblxuICAgICAgICB2YXIgaG93ID0gbnVsbDtcbiAgICAgICAgdmFyIHdoZXJlID0gW3Jvd0lkeCwgY29sSWR4XTtcbiAgICAgICAgaWYgKGhvcml6b250YWwpIGhvdyA9ICdIT1JJWk9OVEFMJztcbiAgICAgICAgaWYgKHZlcnRpY2FsKSAgIGhvdyA9ICdWRVJUSUNBTCc7XG4gICAgICAgIGlmICh1cGRpYWcpICAgICBob3cgPSAnVVBESUFHT05BTCc7XG4gICAgICAgIGlmIChkb3duZGlhZykgeyBob3cgPSAnRE9XTkRJQUdPTkFMJzsgd2hlcmUgPSBbcm93SWR4KzMsIGNvbElkeF07IH1cblxuICAgICAgICBpZiAoaG93KSByZXR1cm4geyBob3c6IGhvdywgd2hlcmU6IHdoZXJlIH07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcbiIsIlxudmFyIEJvYXJkID0gcmVxdWlyZSgnLi9ib2FyZCcpO1xudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCcuLi91dGlscy9jbG9uZScpO1xuXG4vLyBHYW1lIGxvZ2ljIG1vZHVsZS5cbi8vIEFsbCBmdW5jdGlvbnMgYXJlIHB1cmUsIHRvIGdldCBhbiBpbml0aWFsIGdhbWUgY2FsbCBgaW5pdGAuXG4vLyBBbGwgZnVuY3Rpb25zIHJldHVybiB0aGUgbW9kaWZpZWQgZ2FtZSBkYXRhIHN0cnVjdHVyZSwgdGhleSBkbyBub3QgbW9kaWZ5XG4vLyB0aGUgb3JpZ2luYWwgZ2FtZS5cblxuLy8gR2FtZSBzdGF0ZXMgKGNvbnN0YW50cykuXG4vLyBJTklUIGZvciB0aGUgaW5pdGlhbCBzdGF0ZSB3YWl0aW5nIGZvciBwbGF5ZXJzLlxuLy8gQkxVRSBhbmQgUkVEIGFyZSBmb3IgZWFjaCBwbGF5ZXJzIHR1cm4gdG8gcGxheSAoaW1wbHkgZ2FtZSBzdGFydGVkKVxuLy8gR0FNRU9WRVIgaXMgd2hlbiB0aGUgZ2FtZSBpcyBmaW5pc2hlZFxudmFyIFN0YXRlcyA9IGV4cG9ydHMuU3RhdGVzID0ge1xuICBJTklUOiAnSU5JVCcsXG4gIEJMVUU6ICdCTFVFJyxcbiAgUkVEOiAnUkVEJyxcbiAgR0FNRU9WRVI6ICdHQU1FT1ZFUidcbn07XG5cbi8vIEluaXRpYWxpemUgYSBnYW1lLiBMZWF2ZSBpdCBpbiBpbml0aWFsIHN0YXRlLiBOZXh0IHN0ZXAgaXMgYHN0YXJ0YCB3aXRoIHRoZVxuLy8gcGxheWVyIG5hbWVzLlxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcGxheWVyczogeyBibHVlOiAnJywgcmVkOiAnJyB9LFxuICAgIGJvYXJkOiBCb2FyZCg3KSxcbiAgICBzdGF0ZTogU3RhdGVzLklOSVRcbiAgfTtcbn07XG5cbi8vIFN0YXJ0IGEgZ2FtZSB3aXRoIGBwbGF5ZXIxYCwgYW5kIGBwbGF5ZXIyYC5cbi8vIFRocm93cyBpZiBpdCBkb2Vzbid0IGNvbWUgZnJvbSBpbml0aWFsIHN0YXRlLCBvciB0aGUgcGxheWVycyBhcmUgbm90IHZhbGlkLlxuLy8gR2l2ZXMgdGhlIGZpcnN0IHR1cm4gdG8gdGhlIGZpcnN0IHBsYXllci5cbmV4cG9ydHMuc3RhcnQgPSBmdW5jdGlvbihwbGF5ZXIxLCBwbGF5ZXIyLCBnYW1lKSB7XG4gIGlmIChnYW1lLnN0YXRlICE9PSBTdGF0ZXMuSU5JVClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3Qgc3RhcnQgYSBnYW1lIHRoYXQgaXMgbm90IG5ldycpO1xuICBpZiAoIVBsYXllci52YWxpZChwbGF5ZXIxKSB8fCAhUGxheWVyLnZhbGlkKHBsYXllcjIpKVxuICAgIHRocm93IG5ldyBFcnJvcignU29tZSBwbGF5ZXIgbmFtZXMgYXJlIG5vdCB2YWxpZC4nLCBwbGF5ZXIxLCBwbGF5ZXIyKTtcblxuICB2YXIgc3RhcnRlZCA9IGNsb25lKGdhbWUpO1xuICBzdGFydGVkLnBsYXllcnMuYmx1ZSA9IHBsYXllcjE7XG4gIHN0YXJ0ZWQucGxheWVycy5yZWQgPSBwbGF5ZXIyO1xuICBzdGFydGVkLnN0YXRlID0gU3RhdGVzLkJMVUU7XG4gIHJldHVybiBzdGFydGVkO1xufTtcblxuLy8gTWFrZSBhIG1vdmUuIFdobyBtb3ZlcyBpcyBkZXRlcm1pbmVkIHdpdGggdGhlIGdhbWUgc3RhdGUsIG5vIG5lZWQgdG8gc3BlY2lmeVxuLy8gaXQuXG4vLyBDYW4ganVzdCBiZSBkb25lIHdoZW4gZ2FtZSBpcyBzdGFydGVkIChCTFVFIG9yIFJFRCBzdGF0ZXMpLlxuLy8gQWZ0ZXIgbW92aW5nLCBpdCBjaGVja3MgZm9yIDQgaW5saW5lcyBhbmQgcmV0dXJucyB0aGUgd2luIGlmIHRoZXJlIHdlcmUuXG4vLyBJdCBhbHNvIGNoZWNrcyBmb3IgZnVsbCBib2FyZCAobm90IHN1cmUgaWYgdGhpcyBjYW4gaGFwcGVuIDpzKS5cbi8vIEZpbmFsbHkgaWYgbm90aGluZyBpbnRlcmVzdGluZyBoYXBwZW5lZCBpdCBqdXN0IGNoYW5nZXMgdHVybiB0byB0aGUgb3RoZXJcbi8vIHBsYXllci5cbmV4cG9ydHMucGxheSA9IGZ1bmN0aW9uKGNvbCwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLkJMVUUgJiYgZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLlJFRClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW4gb25seSBwbGF5IHdoZW4gdGhlIGdhbWUgaXMgcnVubmluZycpXG5cbiAgdmFyIHBsYXllZCA9IGNsb25lKGdhbWUpO1xuICBwbGF5ZWQuYm9hcmQgPSBCb2FyZC5wdXQoY29sLCBCb2FyZC5DaGlwc1twbGF5ZWQuc3RhdGVdLCBwbGF5ZWQuYm9hcmQpO1xuXG4gIHZhciBmb3VySW5saW5lID0gQm9hcmQuaGFzRm91cklubGluZShwbGF5ZWQuYm9hcmQpO1xuICBpZiAoZm91cklubGluZSkge1xuICAgIHJldHVybiB3aW4oZm91cklubGluZSwgcGxheWVkKTtcbiAgfVxuXG4gIGlmIChCb2FyZC5pc0Z1bGwocGxheWVkLmJvYXJkKSkge1xuICAgIHJldHVybiBnYW1lT3ZlcihwbGF5ZWQpO1xuICB9XG5cbiAgcmV0dXJuIHN3aXRjaFR1cm4ocGxheWVkKTtcbn07XG5cbi8vIFV0aWxpdHkgZnVuY3Rpb24gdG8gc3dpdGNoIHRoZSB0dXJuIG9mIHRoZSBwbGF5ZXIgaW4gdGhlIGdhbWUgc3RhdGUuXG5mdW5jdGlvbiBzd2l0Y2hUdXJuKGdhbWUpIHtcbiAgdmFyIHR1cm4gPSBnYW1lLnN0YXRlID09PSBTdGF0ZXMuQkxVRSA/IFN0YXRlcy5SRUQgOiBTdGF0ZXMuQkxVRTtcbiAgZ2FtZS5zdGF0ZSA9IHR1cm47XG4gIHJldHVybiBnYW1lO1xufVxuXG4vLyBQdXRzIGEgZ2FtZSBpbnRvIGdhbWUgb3ZlclxuZnVuY3Rpb24gZ2FtZU92ZXIoZ2FtZSkge1xuICB2YXIgb3ZlciA9IGNsb25lKGdhbWUpO1xuICBvdmVyLnN0YXRlID0gU3RhdGVzLkdBTUVPVkVSO1xuICByZXR1cm4gb3Zlcjtcbn1cblxuLy8gR2l2ZW4gYSB3aW5uaW5nIDQgaW4gbGluZSAobGlrZSB0aGUgb25lIGZyb20gQm9hcmQuaGFzRm91cklubGluZSksIGl0IHB1dHNcbi8vIHRoZSBnYW1lIGludG8gZ2FtZSBvdmVyIGFuZCBmaWxscyB0aGUgd2lubmluZyBpbmZvcm1hdGlvbi5cbmZ1bmN0aW9uIHdpbihmb3VySW5saW5lLCBnYW1lKSB7XG4gIHZhciB3b24gPSBjbG9uZShnYW1lKTtcbiAgd29uLndpbm5lciA9IGdhbWUuc3RhdGU7XG4gIHdvbi5zdGF0ZSA9IFN0YXRlcy5HQU1FT1ZFUjtcbiAgd29uLmxpbmUgPSBmb3VySW5saW5lO1xuICByZXR1cm4gd29uO1xufVxuXG4vLyBVdGlsaXR5LiBMb2dzIGEgZ2FtZSBpbiBhIGFzY2lpIHJlYWRhYmxlIHdheS5cbmV4cG9ydHMucHJpbnQgPSBmdW5jdGlvbihnKSB7XG4gIGNvbnNvbGUubG9nKCcgJywgZy5zdGF0ZSwgJ3dpbm5lcjonLCBnLndpbm5lcixcbiAgICAgICAgICAgICAgJ2xpbmU6JywgZy5saW5lICYmIGcubGluZS5ob3csIGcubGluZSAmJiBnLmxpbmUud2hlcmUuam9pbignLCAnKSk7XG4gIGNvbnNvbGUubG9nKFxuICAgIGcuYm9hcmQuY2VsbHMubWFwKGZ1bmN0aW9uKHIpIHtcbiAgICAgIHJldHVybiBbJyddLmNvbmNhdChyKS5jb25jYXQoWycnXSkuam9pbignfCcpO1xuICAgIH0pLnJldmVyc2UoKS5qb2luKCdcXG4nKVxuICApO1xuICBjb25zb2xlLmxvZyhnKTtcbn07XG5cbmZ1bmN0aW9uIGdldFBsYXllcihzdGF0ZSwgZ2FtZSkge1xuICByZXR1cm4gZ2FtZS5wbGF5ZXJzW3N0YXRlLnRvTG93ZXJDYXNlKCldXG59XG5cbi8vIFJldHVybnMgdGhlIGN1cnJlbnQgcGxheWVyJ3MgbmFtZS5cbmV4cG9ydHMuY3VycmVudFBsYXllciA9IGZ1bmN0aW9uKGdhbWUpIHtcbiAgcmV0dXJuIGdldFBsYXllcihnYW1lLnN0YXRlLCBnYW1lKTtcbn07XG5cbi8vIFJldHVybnMgdGhlIHdpbm5lciBwbGF5ZXIncyBuYW1lLlxuZXhwb3J0cy53aW5uZXIgPSBmdW5jdGlvbihnYW1lKSB7XG4gIHJldHVybiBnZXRQbGF5ZXIoZ2FtZS53aW5uZXIsIGdhbWUpO1xufTtcblxuLy8gUmV0dXJucyB0aGUgbG9vc2VyIHBsYXllcidzIG5hbWUuXG5leHBvcnRzLmxvb3NlciA9IGZ1bmN0aW9uKGdhbWUpIHtcbiAgdmFyIHcgPSBleHBvcnRzLndpbm5lcihnYW1lKTtcbiAgcmV0dXJuIGdhbWUucGxheWVycy5ibHVlID09PSB3ID8gZ2FtZS5wbGF5ZXJzLnJlZCA6IGdhbWUucGxheWVycy5ibHVlO1xufTtcbiIsIlxuLy8gVmFsaWRhdGUgcGxheWVyIG5hbWVcbi8vICogTXVzdCBiZSBhIHN0cmluZ1xuLy8gKiBOb3QgYmUgZW1wdHlcbmV4cG9ydHMudmFsaWQgPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgcmV0dXJuIHR5cGVvZiBwbGF5ZXIgPT09ICdzdHJpbmcnICYmIHBsYXllciAhPT0gJyc7XG59O1xuIiwiXG4vLyBBcHAgZW50cnkgcG9pbnQuXG4vLyBKdXN0IGluaXQgdGhlIFVJLiBBdCB0aGUgbW9tZW50IGl0IGlzIHRoZSBVSSB3aG8gZHJpdmVzIHRoZSBnYW1lIGxvZ2ljLlxuXG52YXIgVUkgPSByZXF1aXJlKCcuL3VpJyk7XG5VSS5pbml0KCdjb25uZWN0NCcpO1xuIiwiXG52YXIgZG9taWZ5ID0gcmVxdWlyZSgnZG9taWZ5Jyk7XG5cblxudmFyIENvbm5lY3Q0ID0gcmVxdWlyZSgnLi4vZ2FtZScpO1xuXG4vLyBIVE1MIHRlbXBsYXRlLiBCcm93c2VyaWZ5IGlubGluZXMgZmlsZSBmcm9tIHRoZSBmcy5yZWFkRmlsZVN5bmMuXG52YXIgR2FtZU92ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2NyZWVuOiBkb21pZnkoXCI8ZGl2IGNsYXNzPSdnYW1lLW92ZXInPlxcbiAgPGgyPkNvbmdyYXR1bGF0aW9ucyA8c3BhbiBjbGFzcz0nd2lubmVyJz48L3NwYW4+PC9oMj5cXG4gIDxoND5NYXliZSBuZXh0IHRpbWUgPHNwYW4gY2xhc3M9J2xvb3Nlcic+PC9zcGFuPiA6KDwvaDQ+XFxuICA8YnV0dG9uIGNsYXNzPSdyZXN0YXJ0Jz5UcnkgYWdhaW4/PC9idXR0b24+XFxuPC9kaXY+XFxuXCIpXG59O1xuXG4vLyBTdGFydCB0aGUgc2NyZWVuLlxuLy8gQXR0YWNoIHRoZSB0ZW1wbGF0ZSB0byB0aGUgZG9tIG5vZGUuIFNhdmUgcmVmZXJlbmNlcyB0byBkb20gcGxhY2VzIHdlIG5lZWRcbi8vIHRvIGludGVyYWN0IHdpdGguXG4vLyBEcmF3IHRoZSBzY3JlZW4gKHdpbm5lciBsb29zZXIpXG4vLyBTZXQgdXAgZXZlbnRzIGZvciByZXN0YXJ0aW5nXG5HYW1lT3Zlci5pbml0ID0gZnVuY3Rpb24odWksIHJlc3RhcnQpIHtcbiAgdWkuZG9tLmFwcGVuZENoaWxkKEdhbWVPdmVyLnNjcmVlbi5jbG9uZU5vZGUodHJ1ZSkpO1xuXG4gIHZhciBzY3JlZW4gPSB7XG4gICAgd2lubmVyOiB1aS5kb20ucXVlcnlTZWxlY3RvcignLndpbm5lcicpLFxuICAgIGxvb3NlcjogdWkuZG9tLnF1ZXJ5U2VsZWN0b3IoJy5sb29zZXInKSxcbiAgfTtcblxuICBzY3JlZW4ud2lubmVyLnRleHRDb250ZW50ID0gQ29ubmVjdDQud2lubmVyKHVpLmdhbWUpO1xuICBzY3JlZW4ubG9vc2VyLnRleHRDb250ZW50ID0gQ29ubmVjdDQubG9vc2VyKHVpLmdhbWUpO1xuXG4gIHVpLmV2ZW50cy5vbignY2xpY2snLCAnLnJlc3RhcnQnLCByZXN0YXJ0LmJpbmQobnVsbCwgdWkpKTtcblxuICByZXR1cm4gc2NyZWVuO1xufTtcblxuIiwidmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xuXG5cbnZhciBDb25uZWN0NCA9IHJlcXVpcmUoJy4uL2dhbWUnKTtcblxuLy8gSFRNTCB0ZW1wbGF0ZS4gQnJvd3NlcmlmeSBpbmxpbmVzIGZpbGUgZnJvbSB0aGUgZnMucmVhZEZpbGVTeW5jLlxudmFyIEdhbWUgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2NyZWVuOiBkb21pZnkoXCJcXG48cCBjbGFzcz0ndHVybic+XFxuSXQgaXMgPHNwYW4+PC9zcGFuPidzIHR1cm5cXG48L3A+XFxuPGRpdiBjbGFzcz0nYm9hcmQnPlxcbiAgPGRpdiBjbGFzcz0nY2VsbCc+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG48cCBjbGFzcz0nbXNnJz48L3A+XFxuXCIpXG59O1xuXG4vLyBTdGFydCB0aGUgc2NyZWVuLlxuLy8gQXR0YWNoIHRoZSB0ZW1wbGF0ZSB0byB0aGUgZG9tIG5vZGUuIFNhdmUgcmVmZXJlbmNlcyB0byBkb20gcGxhY2VzIHdlIG5lZWRcbi8vIHRvIGludGVyYWN0IHdpdGguXG4vLyBTZXQgdXAgZXZlbnRzXG5HYW1lLmluaXQgPSBmdW5jdGlvbih1aSwgcGxheSkge1xuICB1aS5kb20uYXBwZW5kQ2hpbGQoR2FtZS5zY3JlZW4uY2xvbmVOb2RlKHRydWUpKTtcblxuICB2YXIgc2NyZWVuID0ge1xuICAgIC8vIENlbGwgdGVtcGxhdGVcbiAgICBjZWxsOiB1aS5kb20ucXVlcnlTZWxlY3RvcignLmNlbGwnKSxcbiAgICAvLyBXaG9sZSBib2FyZFxuICAgIGJvYXJkOiB1aS5kb20ucXVlcnlTZWxlY3RvcignLmJvYXJkJyksXG4gICAgLy8gUGxhY2Vob2xkZXIgZm9yIHRoZSBjdXJyZW50IHBsYXllcidzIG5hbWVcbiAgICBuYW1lOiB1aS5kb20ucXVlcnlTZWxlY3RvcignLnR1cm4+c3BhbicpXG4gIH07XG5cbiAgR2FtZS5yZW5kZXIoc2NyZWVuLCB1aSk7XG5cbiAgLy8gV2hlbiB0aGUgdXNlciBjbGlja3Mgb24gYW55IGNlbGwgb2YgdGhlIGJvYXJkIGNhbGwgdGhlIGBwbGF5YCBhY3Rpb24gd2l0aFxuICAvLyB0aGUgcm93IGFuZCBjb2x1bW4gY2xpY2tlZFxuICB1aS5ldmVudHMub24oJ2NsaWNrJywgJy5jZWxsJywgZnVuY3Rpb24oZXYsIGNlbGwpIHtcbiAgICB2YXIgcm93ID0gY2VsbC5kYXRhc2V0LnJvdztcbiAgICB2YXIgY29sID0gY2VsbC5kYXRhc2V0LmNvbDtcbiAgICBwbGF5KHJvdywgY29sLCB1aSk7XG4gIH0pO1xuXG4gIHJldHVybiBzY3JlZW47XG59O1xuXG4vLyBCcnV0ZSBmb3JjZSByZWRyYXdzIHRoZSBkb20gYm9hcmRcbkdhbWUuZHJhd0JvYXJkID0gZnVuY3Rpb24oc2NyZWVuLCBib2FyZCkge1xuICAvLyBDbGVhbiBib2FyZFxuICBzY3JlZW4uYm9hcmQuaW5uZXJIVE1MID0gJyc7XG5cbiAgLy8gUGFyc2UgZ2FtZSBsb2dpYyBjZWxscyB0byBkb20gY2VsbHNcbiAgdmFyIGRvbUJvYXJkID0gYm9hcmQuY2VsbHMubWFwKGZ1bmN0aW9uKHJvdywgcikge1xuICAgIHJldHVybiByb3cubWFwKGNlbGxUb0RvbS5iaW5kKG51bGwsIHNjcmVlbi5jZWxsLCByKSk7XG4gIH0pO1xuXG4gIC8vIFNldCB0aGUgcm93cyBhbmQgY2VsbHMgaW4gdGhlIGRvbS4gV2UgbmVlZCB0byByZXZlcnNlIHRoZSByb3dzLCBvciBpdFxuICAvLyB3b3VsZCBiZSByZXZlcnNlIDQgaW4gbGluZS5cbiAgZG9tQm9hcmQucmV2ZXJzZSgpLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xuICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICBzY3JlZW4uYm9hcmQuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLy8gVGFrZXMgYSBjZWxsRG9tIHRlbXBsYXRlLCByb3cgaW5kZXgsIGNlbGwgdmFsdWUsIGNvbHVtbiBpbmRleCwgYW5kIGNyZWF0ZXNcbi8vIGEgbmV3IGNlbGwgZG9tIHdpdGggdGhlIHJvdyBhbmQgaW5kZXggYXMgZGF0YSBhdHRyaWJ1dGVzLlxuZnVuY3Rpb24gY2VsbFRvRG9tKGNlbGxEb20sIHJvdywgY2VsbCwgY29sKSB7XG4gIHZhciBuYyA9IGNlbGxEb20uY2xvbmVOb2RlKHRydWUpO1xuICBuYy5kYXRhc2V0LnJvdyA9IHJvdztcbiAgbmMuZGF0YXNldC5jb2wgPSBjb2w7XG4gIG5jLnRleHRDb250ZW50ID0gY2VsbDtcbiAgcmV0dXJuIG5jO1xufVxuXG4vLyBTZXRzIHRoZSBwbGF5ZXIgbmFtZSB0aGF0IG5lZWRzIHRvIG1vdmUgaW4gdGhlIFVJLlxuR2FtZS5kcmF3VHVybiA9IGZ1bmN0aW9uKHNjcmVlbiwgdWkpIHtcbiAgc2NyZWVuLm5hbWUudGV4dENvbnRlbnQgPSBDb25uZWN0NC5jdXJyZW50UGxheWVyKHVpLmdhbWUpO1xufTtcblxuLy8gUmVuZGVyIHRoZSB3aG9sZSBnYW1lIHNjcmVlbiAodHVybiBhbmQgYm9hcmQpXG5HYW1lLnJlbmRlciA9IGZ1bmN0aW9uKHNjcmVlbiwgdWkpIHtcbiAgR2FtZS5kcmF3VHVybihzY3JlZW4sIHVpKTtcbiAgR2FtZS5kcmF3Qm9hcmQoc2NyZWVuLCB1aS5nYW1lLmJvYXJkKTtcbn07XG5cbiIsIlxuLy8gTWFpbiBkb20gVUkgbW9kdWxlLiBEcml2ZXMgYSBnYW1lIGluc3RhbmNlIGFuZCB0aGUgdmlldyBzdGF0ZXMuXG5cbi8vIERvbSB1dGlsaXRpZXNcbnZhciBkb21yZWFkeSA9IHJlcXVpcmUoJ2RvbXJlYWR5Jyk7XG52YXIgZGVsZWdhdGUgPSByZXF1aXJlKCdkb20tZGVsZWdhdGUnKTtcblxuLy8gR2FtZSBsb2dpY1xudmFyIENvbm5lY3Q0ID0gcmVxdWlyZSgnLi4vZ2FtZScpO1xuXG4vLyBTdWJ2aWV3cyAoc2NyZWVucy9zdGF0ZXMpXG52YXIgSW5pdGlhbCA9IHJlcXVpcmUoJy4vaW5pdGlhbCcpO1xudmFyIEdhbWUgPSByZXF1aXJlKCcuL2dhbWUnKTtcbnZhciBHYW1lT3ZlciA9IHJlcXVpcmUoJy4vZ2FtZS1vdmVyJyk7XG5cbi8vIEluaXRpYWxpemUgYSB2aWV3IGdpdmVuIGEgZG9tIGlkLiBJdCBpcyBzZWxmIGRyaXZlbiBmcm9tIHRoZXJlLlxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oaWQpIHtcbiAgZG9tcmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXG4gICAgLy8gVUkgc3RhdGUsIHRoaXMgd2lsbCBiZSBwYXNzZWQgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHN0ZXBzLCBhbmQgY29udGFpbnNcbiAgICAvLyB0aGUgdWkgYW5kIGdhbWUgaW5mb3JtYXRpb24uXG4gICAgdmFyIHVpID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgZG9tOiBkb20sXG4gICAgICBnYW1lOiBDb25uZWN0NC5pbml0KCksIC8vIEdhbWUgbG9naWMgaW5zdGFuY2VcbiAgICAgIGV2ZW50czogZGVsZWdhdGUoZG9tKSwgLy8gRGVsZWdhdGVkIGV2ZW50cyBodWJcbiAgICAgIHZpZXdzOiB7ICAgICAgICAgLy8gU2NyZWVucyBvZiB0aGUgVUkuXG4gICAgICAgIGluaXRpYWw6IG51bGwsIC8vIEF0IHRoZSBiZWdpbm5pbmcgYWxsIHRoZSBzdGVwcyBhcmUgbm9uIGV4aXN0ZW50LlxuICAgICAgICBnYW1lOiBudWxsLCAgICAvLyBXZSB3aWxsIGZpbGwgdGhlbSBhbG9uZyB0aGUgd2F5IHdoZW4gd2UgbmVlZCB0aGVtLlxuICAgICAgICBnYW1lT3ZlcjogbnVsbFxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBTdGFydCB0aGUgaW5pdGlhbCBzY3JlZW4uIEdpdmUgaXQgYSBjYWxsYmFjayB0aGF0IHdpbGwgcmVjZWl2ZSB0aGVcbiAgICAvLyBwYXJhbWV0ZXJzIHRvIHN0YXJ0IHRoZSBnYW1lLlxuICAgIHVpLnZpZXdzLmluaXRpYWwgPSBJbml0aWFsLmluaXQodWksIHN0YXJ0R2FtZSk7XG5cbiAgfSk7XG59XG5cbi8vIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHdlIGhhdmUgdGhlIGJsdWUgYW5kIHJlZCBwbGF5ZXJzLCBhbmQgd2FudCB0b1xuLy8gc3RhcnQgdGhlIGdhbWUuXG5mdW5jdGlvbiBzdGFydEdhbWUoYmx1ZSwgcmVkLCB1aSkge1xuICAvLyBJdCB0cmllcyB0byBzdGFydCB0aGUgZ2FtZSBsb2dpYy4gSWYgaXQgZmFpbHMgKHN0YXRlIG9mIHBsYXllclxuICAvLyB2YWxpZGF0aW9ucykgdGhlbiByZXR1cm4gdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0b3AgdHJhbnNpdGlvbmluZ1xuICB0cnkge1xuICAgIHVpLmdhbWUgPSBDb25uZWN0NC5zdGFydChibHVlLCByZWQsIHVpLmdhbWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGUubWVzc2FnZTtcbiAgfVxuXG4gIC8vIElmIHRoZSBnYW1lIHN0YXJ0ZWQgc3VjY2Vzc2Z1bGx5IHRyYW5zaXRpb24gdG8gdGhlIGdhbWUgc2NyZWVuXG4gIGNsZWFuU2NyZWVuKHVpKTtcbiAgLy8gdXNlclBsYXlzIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHVzZXIgd2FudHMgdG8gbWFrZSBhIG1vdmUgaW4gdGhlIGdhbWUgc2NyZWVuXG4gIHVpLnZpZXdzLmdhbWUgPSBHYW1lLmluaXQodWksIHVzZXJQbGF5cyk7XG59XG5cbi8vIE1ha2UgYSBtb3ZlbWVudCBpbiB0aGUgZ2FtZSBVSS4gTW92ZXMgaW4gdGhlIGdhbWUgbG9naWMsIHJlLXJlbmRlcnMgdGhlIGdhbWVcbi8vIHNjcmVlbiB0byB1cGRhdGUsIGFuZCBjaGVja3MgaWYgdGhlIGdhbWUgaGFzIGZpbmlzaGVkLlxuZnVuY3Rpb24gdXNlclBsYXlzKHJvdywgY29sLCB1aSkge1xuICB1aS5nYW1lID0gQ29ubmVjdDQucGxheShjb2wsIHVpLmdhbWUpO1xuICBHYW1lLnJlbmRlcih1aS52aWV3cy5nYW1lLCB1aSk7XG4gIGlmICh1aS5nYW1lLnN0YXRlID09PSBDb25uZWN0NC5TdGF0ZXMuR0FNRU9WRVIpXG4gICAgZ2FtZUZpbmlzaGVkKHVpKTtcbn1cblxuLy8gR2FtZSBpcyBvdmVyLiBUcmFuc2l0aW9uIHRvIHRoZSBnYW1lIG92ZXIgc2NyZWVuLlxuLy8gV2UgZG9uJ3QgY2xlYXIgdGhlIHNjcmVlbiBiZWNhdXNlIGdhbWVPdmVyIGhhcyBjc3MgdG8gYmUgYW4gb3ZlcmxheSwgc28gdGhhdFxuLy8gd2UgY2FuIHNlZSB0aGUgYm9hcmQgZXZlbiB0aG91Z2ggaXQgZmluaXNoZWQuXG5mdW5jdGlvbiBnYW1lRmluaXNoZWQodWkpIHtcbiAgdWkudmlld3MuZ2FtZU92ZXIgPSBHYW1lT3Zlci5pbml0KHVpLCByZXN0YXJ0KTtcbn1cblxuLy8gVXNlciB3YW50cyBhIHJlc3RhcnQuIENsZWFuIHNjcmVlbiBhbmQgZXZlbnRzIGFuZCBtYWtlIGEgYnJ1dGUgcmVzdGFydC5cbmZ1bmN0aW9uIHJlc3RhcnQodWkpIHtcbiAgY2xlYW5TY3JlZW4odWkpO1xuICB1aS5ldmVudHMub2ZmKCk7XG4gIGV4cG9ydHMuaW5pdCh1aS5pZCk7XG59XG5cbi8vIFV0aWxpdHkgZnVuY3Rpb24gdG8gY2xlYW4gdGhlIFVJLlxuZnVuY3Rpb24gY2xlYW5TY3JlZW4odWkpIHtcbiAgdWkuZG9tLmlubmVySFRNTCA9ICcnO1xufVxuXG4iLCJ2YXIgZG9taWZ5ID0gcmVxdWlyZSgnZG9taWZ5Jyk7XG5cblxuLy8gSFRNTCB0ZW1wbGF0ZS4gQnJvd3NlcmlmeSBpbmxpbmVzIGZpbGUgZnJvbSB0aGUgZnMucmVhZEZpbGVTeW5jLlxudmFyIEluaXRpYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2NyZWVuOiBkb21pZnkoXCI8ZGl2IGNsYXNzPVxcXCJ3ZWxjb21lXFxcIj5cXG4gIDxwPldlbGNvbWUgdG8gY29ubmVjdDQ8L3A+XFxuICA8cD5DaG9vc2UgdGhlIG5hbWUgb2YgdGhlIHBsYXllcnM8L3A+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicGxheWVyTmFtZXNcXFwiPlxcbiAgPGlucHV0IHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPSdwbGF5ZXIxJyAvPlxcbiAgPGlucHV0IHR5cGU9J3RleHQnIHBsYWNlaG9sZGVyPSdwbGF5ZXIyJyAvPlxcbiAgPGJ1dHRvbj5TdGFydCBnYW1lPC9idXR0b24+XFxuICA8c3BhbiBjbGFzcz0nbXNnJz48L3NwYW4+XFxuPC9kaXY+XFxuXCIpXG59O1xuXG4vLyBTdGFydCB0aGUgc2NyZWVuLlxuLy8gQXR0YWNoIHRoZSB0ZW1wbGF0ZSB0byB0aGUgZG9tIG5vZGUuIFNhdmUgcmVmZXJlbmNlcyB0byBkb20gcGxhY2VzIHdlIG5lZWRcbi8vIHRvIGludGVyYWN0IHdpdGguXG4vLyBTZXQgdXAgZXZlbnRzXG5Jbml0aWFsLmluaXQgPSBmdW5jdGlvbih1aSwgZG9uZSkge1xuICB1aS5kb20uYXBwZW5kQ2hpbGQoSW5pdGlhbC5zY3JlZW4uY2xvbmVOb2RlKHRydWUpKTtcblxuICB2YXIgc2NyZWVuID0ge1xuICAgIC8vIFBsYXllciBuYW1lcyBpbnB1dHNcbiAgICBpbnB1dHM6IHVpLmRvbS5xdWVyeVNlbGVjdG9yQWxsKCcucGxheWVyTmFtZXMgaW5wdXQnKSxcbiAgICAvLyBFcnJvciBtZXNzYWdlcyBwbGFjZWhvbGRlclxuICAgIG1zZzogdWkuZG9tLnF1ZXJ5U2VsZWN0b3IoJy5wbGF5ZXJOYW1lcyBzcGFuLm1zZycpXG4gIH07XG5cbiAgLy8gU3RhcnQgZ2FtZSBidXR0b25cbiAgdWkuZXZlbnRzLm9uKCdjbGljaycsICcucGxheWVyTmFtZXMgYnV0dG9uJywgc2V0UGxheWVycy5iaW5kKG51bGwsIHNjcmVlbiwgdWksIGRvbmUpKTtcbn07XG5cbi8vIENhbGxlZCB0byBzdGFydCB0aGUgZ2FtZS5cbi8vIEdldCB0aGUgcGxheWVyIG5hbWVzIGFuZCBjYWxsIHRoZSBjYWxsYmFjayBgZG9uZWAgZm9yIHN0YXJ0aW5nLiBJZiB0aGVyZSBpc1xuLy8gYW55IGVycm9yIChkb25lIHJldHVybnMgYSBzdHIpLCBzaG93IHRoZSBtc2cuXG5mdW5jdGlvbiBzZXRQbGF5ZXJzKHNjcmVlbiwgdWksIGRvbmUpIHtcbiAgdmFyIGJsdWUgPSBzY3JlZW4uaW5wdXRzWzBdLnZhbHVlO1xuICB2YXIgcmVkID0gc2NyZWVuLmlucHV0c1sxXS52YWx1ZTtcbiAgaWYgKCFibHVlIHx8ICFyZWQpIHtcbiAgICBzY3JlZW4ubXNnLnRleHRDb250ZW50ID0gJ0V2ZXJ5IHBsYXllciBuZWVkcyBhIG5hbWUhJztcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcmVzID0gZG9uZShibHVlLCByZWQsIHVpKTtcbiAgaWYgKHR5cGVvZiByZXMgPT09ICdzdHJpbmcnKVxuICAgIHNjcmVlbi5tc2cudGV4dENvbnRlbnQgPSByZXM7XG59XG4iLCJcbi8vIFV0aWxpdHkgZnVuY3Rpb24gdG8gd29yayB3aXRoIGltbXV0YWJsZSBkYXRhLiBGb3Igbm93IGl0IHVzZXMgdGhlIHNpbXBsZXN0XG4vLyB3YXkgd2l0aCBKU09OLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihqcykge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShqcykpO1xufTtcbiJdfQ==
