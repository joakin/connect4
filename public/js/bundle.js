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

// Creates a board of `size`
// The cells are a vector of vectors
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

Board.Chips = {
  EMPTY: ' ',
  BLUE: 'O',
  RED: 'X'
};


Board.get = function(row, col, b) {
  return b.cells[row][col];
};

Board.set = function(row, col, val, b) {
  var nb = clone(b);
  nb.cells[row][col] = val;
  return nb;
};

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
// Returns { how: TYPE, where: [ROW, COL] } when it finds one
// Pretty hairy code, but well tested.
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

// Game states. BLUE and RED are for each players turn
var States = exports.States = {
  INIT: 'INIT',
  BLUE: 'BLUE',
  RED: 'RED',
  GAMEOVER: 'GAMEOVER'
};

exports.init = function() {
  return {
    players: { blue: '', red: '' },
    board: Board(7),
    state: States.INIT
  };
};

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

function switchTurn(game) {
  var turn = game.state === States.BLUE ? States.RED : States.BLUE;
  game.state = turn;
  return game;
}

function gameOver(game) {
  var over = clone(game);
  over.state = States.GAMEOVER;
  return over;
}

function win(fourInline, game) {
  var won = clone(game);
  won.winner = game.state;
  won.state = States.GAMEOVER;
  won.line = fourInline;
  return won;
}

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

exports.currentPlayer = function(game) {
  return getPlayer(game.state, game);
};

exports.winner = function(game) {
  return getPlayer(game.winner, game);
};

exports.looser = function(game) {
  var w = exports.winner(game);
  return game.players.blue === w ? game.players.red : game.players.blue;
};

},{"../utils/clone":"/Users/jkn/dev/projects/connect4/src/utils/clone.js","./board":"/Users/jkn/dev/projects/connect4/src/game/board.js","./player":"/Users/jkn/dev/projects/connect4/src/game/player.js"}],"/Users/jkn/dev/projects/connect4/src/game/player.js":[function(require,module,exports){

exports.valid = function(player) {
  return typeof player === 'string' && player !== '';
};

},{}],"/Users/jkn/dev/projects/connect4/src/index.js":[function(require,module,exports){

var UI = require('./ui');

UI.init('connect4');

},{"./ui":"/Users/jkn/dev/projects/connect4/src/ui/index.js"}],"/Users/jkn/dev/projects/connect4/src/ui/game-over.js":[function(require,module,exports){

var domify = require('domify');


var Connect4 = require('../game');

var GameOver = module.exports = {
  screen: domify("<div class='game-over'>\n  <h2>Congratulations <span class='winner'></span></h2>\n  <h4>Maybe next time <span class='looser'></span> :(</h4>\n  <button class='restart'>Try again?</button>\n</div>\n")
};

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

var Game = module.exports = {
  screen: domify("\n<p class='turn'>\nIt is <span></span>'s turn\n</p>\n<div class='board'>\n  <div class='cell'>\n  </div>\n</div>\n<p class='msg'></p>\n")
};

Game.init = function(ui, play) {
  ui.dom.appendChild(Game.screen.cloneNode(true));

  var screen = {
    cell: ui.dom.querySelector('.cell'),
    board: ui.dom.querySelector('.board'),
    name: ui.dom.querySelector('.turn>span')
  };

  Game.render(screen, ui);

  ui.events.on('click', '.cell', function(ev, cell) {
    var row = cell.dataset.row;
    var col = cell.dataset.col;
    play(row, col, ui);
  });

  return screen;
};

Game.drawBoard = function(screen, board) {
  // Clean board
  screen.board.innerHTML = '';
  var domBoard = board.cells.map(function(row, r) {
    return row.map(cellToDom.bind(null, screen.cell, r));
  });

  domBoard.reverse().forEach(function (row, i) {
    row.forEach(function (cell, j) {
      screen.board.appendChild(cell);
    });
  });
};

function cellToDom(cellDom, row, cell, col) {
  var nc = cellDom.cloneNode(true);
  nc.dataset.row = row;
  nc.dataset.col = col;
  nc.textContent = cell;
  return nc;
}

Game.drawTurn = function(screen, ui) {
  screen.name.textContent = Connect4.currentPlayer(ui.game);
};

Game.render = function(screen, ui) {
  Game.drawTurn(screen, ui);
  Game.drawBoard(screen, ui.game.board);
};


},{"../game":"/Users/jkn/dev/projects/connect4/src/game/index.js","domify":"/Users/jkn/dev/projects/connect4/node_modules/domify/index.js"}],"/Users/jkn/dev/projects/connect4/src/ui/index.js":[function(require,module,exports){

var domready = require('domready');
var delegate = require('dom-delegate');

var Connect4 = require('../game');

var Initial = require('./initial');
var Game = require('./game');
var GameOver = require('./game-over');

exports.init = function(id) {
  domready(function() {

    var dom = document.getElementById(id);

    var ui = {
      id: id,
      dom: dom,
      game: Connect4.init(),
      events: delegate(dom),
      views: {
        initial: null,
        game: null,
        gameOver: null
      }
    };

    ui.views.initial = Initial.init(ui, startGame);

  });
}

function startGame(blue, red, ui) {
  try {
    ui.game = Connect4.start(blue, red, ui.game);
  } catch (e) {
    return e.message;
  }

  cleanScreen(ui);
  ui.views.game = Game.init(ui, userPlays);
}

function userPlays(row, col, ui) {
  ui.game = Connect4.play(col, ui.game);
  Game.render(ui.views.game, ui);
  if (ui.game.state === Connect4.States.GAMEOVER)
    gameFinished(ui);
}

function gameFinished(ui) {
  ui.views.gameOver = GameOver.init(ui, restart);
}

function restart(ui) {
  cleanScreen(ui);
  ui.events.off();
  exports.init(ui.id);
}

function cleanScreen(ui) {
  ui.dom.innerHTML = '';
}


},{"../game":"/Users/jkn/dev/projects/connect4/src/game/index.js","./game":"/Users/jkn/dev/projects/connect4/src/ui/game.js","./game-over":"/Users/jkn/dev/projects/connect4/src/ui/game-over.js","./initial":"/Users/jkn/dev/projects/connect4/src/ui/initial.js","dom-delegate":"/Users/jkn/dev/projects/connect4/node_modules/dom-delegate/lib/index.js","domready":"/Users/jkn/dev/projects/connect4/node_modules/domready/ready.js"}],"/Users/jkn/dev/projects/connect4/src/ui/initial.js":[function(require,module,exports){
var domify = require('domify');


var Initial = module.exports = {
  screen: domify("<div class=\"welcome\">\n  <p>Welcome to connect4</p>\n  <p>Choose the name of the players</p>\n</div>\n<div class=\"playerNames\">\n  <input type='text' placeholder='player1' />\n  <input type='text' placeholder='player2' />\n  <button>Start game</button>\n  <span class='msg'></span>\n</div>\n")
};

Initial.init = function(ui, done) {
  ui.dom.appendChild(Initial.screen.cloneNode(true));

  var screen = {
    inputs: ui.dom.querySelectorAll('.playerNames input'),
    msg: ui.dom.querySelector('.playerNames span.msg')
  };

  ui.events.on('click', '.playerNames button', setPlayers.bind(null, screen, ui, done));
};

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

module.exports = function(js) {
  return JSON.parse(JSON.stringify(js));
};

},{}]},{},["/Users/jkn/dev/projects/connect4/src/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0ZS9saWIvZGVsZWdhdGUuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRlL2xpYi9pbmRleC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L25vZGVfbW9kdWxlcy9kb21pZnkvaW5kZXguanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9ub2RlX21vZHVsZXMvZG9tcmVhZHkvcmVhZHkuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvZ2FtZS9ib2FyZC5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy9nYW1lL2luZGV4LmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2dhbWUvcGxheWVyLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL3VpL2dhbWUtb3Zlci5qcyIsIi9Vc2Vycy9qa24vZGV2L3Byb2plY3RzL2Nvbm5lY3Q0L3NyYy91aS9nYW1lLmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL3VpL2luZGV4LmpzIiwiL1VzZXJzL2prbi9kZXYvcHJvamVjdHMvY29ubmVjdDQvc3JjL3VpL2luaXRpYWwuanMiLCIvVXNlcnMvamtuL2Rldi9wcm9qZWN0cy9jb25uZWN0NC9zcmMvdXRpbHMvY2xvbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qanNoaW50IGJyb3dzZXI6dHJ1ZSwgbm9kZTp0cnVlKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlbGVnYXRlO1xuXG4vKipcbiAqIERPTSBldmVudCBkZWxlZ2F0b3JcbiAqXG4gKiBUaGUgZGVsZWdhdG9yIHdpbGwgbGlzdGVuXG4gKiBmb3IgZXZlbnRzIHRoYXQgYnViYmxlIHVwXG4gKiB0byB0aGUgcm9vdCBub2RlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtOb2RlfHN0cmluZ30gW3Jvb3RdIFRoZSByb290IG5vZGUgb3IgYSBzZWxlY3RvciBzdHJpbmcgbWF0Y2hpbmcgdGhlIHJvb3Qgbm9kZVxuICovXG5mdW5jdGlvbiBEZWxlZ2F0ZShyb290KSB7XG5cbiAgLyoqXG4gICAqIE1haW50YWluIGEgbWFwIG9mIGxpc3RlbmVyXG4gICAqIGxpc3RzLCBrZXllZCBieSBldmVudCBuYW1lLlxuICAgKlxuICAgKiBAdHlwZSBPYmplY3RcbiAgICovXG4gIHRoaXMubGlzdGVuZXJNYXAgPSBbe30sIHt9XTtcbiAgaWYgKHJvb3QpIHtcbiAgICB0aGlzLnJvb3Qocm9vdCk7XG4gIH1cblxuICAvKiogQHR5cGUgZnVuY3Rpb24oKSAqL1xuICB0aGlzLmhhbmRsZSA9IERlbGVnYXRlLnByb3RvdHlwZS5oYW5kbGUuYmluZCh0aGlzKTtcbn1cblxuLyoqXG4gKiBTdGFydCBsaXN0ZW5pbmcgZm9yIGV2ZW50c1xuICogb24gdGhlIHByb3ZpZGVkIERPTSBlbGVtZW50XG4gKlxuICogQHBhcmFtICB7Tm9kZXxzdHJpbmd9IFtyb290XSBUaGUgcm9vdCBub2RlIG9yIGEgc2VsZWN0b3Igc3RyaW5nIG1hdGNoaW5nIHRoZSByb290IG5vZGVcbiAqIEByZXR1cm5zIHtEZWxlZ2F0ZX0gVGhpcyBtZXRob2QgaXMgY2hhaW5hYmxlXG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5yb290ID0gZnVuY3Rpb24ocm9vdCkge1xuICB2YXIgbGlzdGVuZXJNYXAgPSB0aGlzLmxpc3RlbmVyTWFwO1xuICB2YXIgZXZlbnRUeXBlO1xuXG4gIC8vIFJlbW92ZSBtYXN0ZXIgZXZlbnQgbGlzdGVuZXJzXG4gIGlmICh0aGlzLnJvb3RFbGVtZW50KSB7XG4gICAgZm9yIChldmVudFR5cGUgaW4gbGlzdGVuZXJNYXBbMV0pIHtcbiAgICAgIGlmIChsaXN0ZW5lck1hcFsxXS5oYXNPd25Qcm9wZXJ0eShldmVudFR5cGUpKSB7XG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIHRoaXMuaGFuZGxlLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChldmVudFR5cGUgaW4gbGlzdGVuZXJNYXBbMF0pIHtcbiAgICAgIGlmIChsaXN0ZW5lck1hcFswXS5oYXNPd25Qcm9wZXJ0eShldmVudFR5cGUpKSB7XG4gICAgICAgIHRoaXMucm9vdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIHRoaXMuaGFuZGxlLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgbm8gcm9vdCBvciByb290IGlzIG5vdFxuICAvLyBhIGRvbSBub2RlLCB0aGVuIHJlbW92ZSBpbnRlcm5hbFxuICAvLyByb290IHJlZmVyZW5jZSBhbmQgZXhpdCBoZXJlXG4gIGlmICghcm9vdCB8fCAhcm9vdC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgaWYgKHRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnJvb3RFbGVtZW50O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBub2RlIGF0IHdoaWNoXG4gICAqIGxpc3RlbmVycyBhcmUgYXR0YWNoZWQuXG4gICAqXG4gICAqIEB0eXBlIE5vZGVcbiAgICovXG4gIHRoaXMucm9vdEVsZW1lbnQgPSByb290O1xuXG4gIC8vIFNldCB1cCBtYXN0ZXIgZXZlbnQgbGlzdGVuZXJzXG4gIGZvciAoZXZlbnRUeXBlIGluIGxpc3RlbmVyTWFwWzFdKSB7XG4gICAgaWYgKGxpc3RlbmVyTWFwWzFdLmhhc093blByb3BlcnR5KGV2ZW50VHlwZSkpIHtcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIHRoaXMuaGFuZGxlLCB0cnVlKTtcbiAgICB9XG4gIH1cbiAgZm9yIChldmVudFR5cGUgaW4gbGlzdGVuZXJNYXBbMF0pIHtcbiAgICBpZiAobGlzdGVuZXJNYXBbMF0uaGFzT3duUHJvcGVydHkoZXZlbnRUeXBlKSkge1xuICAgICAgdGhpcy5yb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5EZWxlZ2F0ZS5wcm90b3R5cGUuY2FwdHVyZUZvclR5cGUgPSBmdW5jdGlvbihldmVudFR5cGUpIHtcbiAgcmV0dXJuIFsnYmx1cicsICdlcnJvcicsICdmb2N1cycsICdsb2FkJywgJ3Jlc2l6ZScsICdzY3JvbGwnXS5pbmRleE9mKGV2ZW50VHlwZSkgIT09IC0xO1xufTtcblxuLyoqXG4gKiBBdHRhY2ggYSBoYW5kbGVyIHRvIG9uZVxuICogZXZlbnQgZm9yIGFsbCBlbGVtZW50c1xuICogdGhhdCBtYXRjaCB0aGUgc2VsZWN0b3IsXG4gKiBub3cgb3IgaW4gdGhlIGZ1dHVyZVxuICpcbiAqIFRoZSBoYW5kbGVyIGZ1bmN0aW9uIHJlY2VpdmVzXG4gKiB0aHJlZSBhcmd1bWVudHM6IHRoZSBET00gZXZlbnRcbiAqIG9iamVjdCwgdGhlIG5vZGUgdGhhdCBtYXRjaGVkXG4gKiB0aGUgc2VsZWN0b3Igd2hpbGUgdGhlIGV2ZW50XG4gKiB3YXMgYnViYmxpbmcgYW5kIGEgcmVmZXJlbmNlXG4gKiB0byBpdHNlbGYuIFdpdGhpbiB0aGUgaGFuZGxlcixcbiAqICd0aGlzJyBpcyBlcXVhbCB0byB0aGUgc2Vjb25kXG4gKiBhcmd1bWVudC5cbiAqXG4gKiBUaGUgbm9kZSB0aGF0IGFjdHVhbGx5IHJlY2VpdmVkXG4gKiB0aGUgZXZlbnQgY2FuIGJlIGFjY2Vzc2VkIHZpYVxuICogJ2V2ZW50LnRhcmdldCcuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBMaXN0ZW4gZm9yIHRoZXNlIGV2ZW50c1xuICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBzZWxlY3RvciBPbmx5IGhhbmRsZSBldmVudHMgb24gZWxlbWVudHMgbWF0Y2hpbmcgdGhpcyBzZWxlY3RvciwgaWYgdW5kZWZpbmVkIG1hdGNoIHJvb3QgZWxlbWVudFxuICogQHBhcmFtIHtmdW5jdGlvbigpfSBoYW5kbGVyIEhhbmRsZXIgZnVuY3Rpb24gLSBldmVudCBkYXRhIHBhc3NlZCBoZXJlIHdpbGwgYmUgaW4gZXZlbnQuZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IFtldmVudERhdGFdIERhdGEgdG8gcGFzcyBpbiBldmVudC5kYXRhXG4gKiBAcmV0dXJucyB7RGVsZWdhdGV9IFRoaXMgbWV0aG9kIGlzIGNoYWluYWJsZVxuICovXG5EZWxlZ2F0ZS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudFR5cGUsIHNlbGVjdG9yLCBoYW5kbGVyLCB1c2VDYXB0dXJlKSB7XG4gIHZhciByb290LCBsaXN0ZW5lck1hcCwgbWF0Y2hlciwgbWF0Y2hlclBhcmFtO1xuXG4gIGlmICghZXZlbnRUeXBlKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlKTtcbiAgfVxuXG4gIC8vIGhhbmRsZXIgY2FuIGJlIHBhc3NlZCBhc1xuICAvLyB0aGUgc2Vjb25kIG9yIHRoaXJkIGFyZ3VtZW50XG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICB1c2VDYXB0dXJlID0gaGFuZGxlcjtcbiAgICBoYW5kbGVyID0gc2VsZWN0b3I7XG4gICAgc2VsZWN0b3IgPSBudWxsO1xuICB9XG5cbiAgLy8gRmFsbGJhY2sgdG8gc2Vuc2libGUgZGVmYXVsdHNcbiAgLy8gaWYgdXNlQ2FwdHVyZSBub3Qgc2V0XG4gIGlmICh1c2VDYXB0dXJlID09PSB1bmRlZmluZWQpIHtcbiAgICB1c2VDYXB0dXJlID0gdGhpcy5jYXB0dXJlRm9yVHlwZShldmVudFR5cGUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSGFuZGxlciBtdXN0IGJlIGEgdHlwZSBvZiBGdW5jdGlvbicpO1xuICB9XG5cbiAgcm9vdCA9IHRoaXMucm9vdEVsZW1lbnQ7XG4gIGxpc3RlbmVyTWFwID0gdGhpcy5saXN0ZW5lck1hcFt1c2VDYXB0dXJlID8gMSA6IDBdO1xuXG4gIC8vIEFkZCBtYXN0ZXIgaGFuZGxlciBmb3IgdHlwZSBpZiBub3QgY3JlYXRlZCB5ZXRcbiAgaWYgKCFsaXN0ZW5lck1hcFtldmVudFR5cGVdKSB7XG4gICAgaWYgKHJvb3QpIHtcbiAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIHRoaXMuaGFuZGxlLCB1c2VDYXB0dXJlKTtcbiAgICB9XG4gICAgbGlzdGVuZXJNYXBbZXZlbnRUeXBlXSA9IFtdO1xuICB9XG5cbiAgaWYgKCFzZWxlY3Rvcikge1xuICAgIG1hdGNoZXJQYXJhbSA9IG51bGw7XG5cbiAgICAvLyBDT01QTEVYIC0gbWF0Y2hlc1Jvb3QgbmVlZHMgdG8gaGF2ZSBhY2Nlc3MgdG9cbiAgICAvLyB0aGlzLnJvb3RFbGVtZW50LCBzbyBiaW5kIHRoZSBmdW5jdGlvbiB0byB0aGlzLlxuICAgIG1hdGNoZXIgPSBtYXRjaGVzUm9vdC5iaW5kKHRoaXMpO1xuXG4gIC8vIENvbXBpbGUgYSBtYXRjaGVyIGZvciB0aGUgZ2l2ZW4gc2VsZWN0b3JcbiAgfSBlbHNlIGlmICgvXlthLXpdKyQvaS50ZXN0KHNlbGVjdG9yKSkge1xuICAgIG1hdGNoZXJQYXJhbSA9IHNlbGVjdG9yO1xuICAgIG1hdGNoZXIgPSBtYXRjaGVzVGFnO1xuICB9IGVsc2UgaWYgKC9eI1thLXowLTlcXC1fXSskL2kudGVzdChzZWxlY3RvcikpIHtcbiAgICBtYXRjaGVyUGFyYW0gPSBzZWxlY3Rvci5zbGljZSgxKTtcbiAgICBtYXRjaGVyID0gbWF0Y2hlc0lkO1xuICB9IGVsc2Uge1xuICAgIG1hdGNoZXJQYXJhbSA9IHNlbGVjdG9yO1xuICAgIG1hdGNoZXIgPSBtYXRjaGVzO1xuICB9XG5cbiAgLy8gQWRkIHRvIHRoZSBsaXN0IG9mIGxpc3RlbmVyc1xuICBsaXN0ZW5lck1hcFtldmVudFR5cGVdLnB1c2goe1xuICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgIG1hdGNoZXI6IG1hdGNoZXIsXG4gICAgbWF0Y2hlclBhcmFtOiBtYXRjaGVyUGFyYW1cbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBldmVudCBoYW5kbGVyXG4gKiBmb3IgZWxlbWVudHMgdGhhdCBtYXRjaFxuICogdGhlIHNlbGVjdG9yLCBmb3JldmVyXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFtldmVudFR5cGVdIFJlbW92ZSBoYW5kbGVycyBmb3IgZXZlbnRzIG1hdGNoaW5nIHRoaXMgdHlwZSwgY29uc2lkZXJpbmcgdGhlIG90aGVyIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc2VsZWN0b3JdIElmIHRoaXMgcGFyYW1ldGVyIGlzIG9taXR0ZWQsIG9ubHkgaGFuZGxlcnMgd2hpY2ggbWF0Y2ggdGhlIG90aGVyIHR3byB3aWxsIGJlIHJlbW92ZWRcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gW2hhbmRsZXJdIElmIHRoaXMgcGFyYW1ldGVyIGlzIG9taXR0ZWQsIG9ubHkgaGFuZGxlcnMgd2hpY2ggbWF0Y2ggdGhlIHByZXZpb3VzIHR3byB3aWxsIGJlIHJlbW92ZWRcbiAqIEByZXR1cm5zIHtEZWxlZ2F0ZX0gVGhpcyBtZXRob2QgaXMgY2hhaW5hYmxlXG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbihldmVudFR5cGUsIHNlbGVjdG9yLCBoYW5kbGVyLCB1c2VDYXB0dXJlKSB7XG4gIHZhciBpLCBsaXN0ZW5lciwgbGlzdGVuZXJNYXAsIGxpc3RlbmVyTGlzdCwgc2luZ2xlRXZlbnRUeXBlO1xuXG4gIC8vIEhhbmRsZXIgY2FuIGJlIHBhc3NlZCBhc1xuICAvLyB0aGUgc2Vjb25kIG9yIHRoaXJkIGFyZ3VtZW50XG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICB1c2VDYXB0dXJlID0gaGFuZGxlcjtcbiAgICBoYW5kbGVyID0gc2VsZWN0b3I7XG4gICAgc2VsZWN0b3IgPSBudWxsO1xuICB9XG5cbiAgLy8gSWYgdXNlQ2FwdHVyZSBub3Qgc2V0LCByZW1vdmVcbiAgLy8gYWxsIGV2ZW50IGxpc3RlbmVyc1xuICBpZiAodXNlQ2FwdHVyZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5vZmYoZXZlbnRUeXBlLCBzZWxlY3RvciwgaGFuZGxlciwgdHJ1ZSk7XG4gICAgdGhpcy5vZmYoZXZlbnRUeXBlLCBzZWxlY3RvciwgaGFuZGxlciwgZmFsc2UpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJNYXAgPSB0aGlzLmxpc3RlbmVyTWFwW3VzZUNhcHR1cmUgPyAxIDogMF07XG4gIGlmICghZXZlbnRUeXBlKSB7XG4gICAgZm9yIChzaW5nbGVFdmVudFR5cGUgaW4gbGlzdGVuZXJNYXApIHtcbiAgICAgIGlmIChsaXN0ZW5lck1hcC5oYXNPd25Qcm9wZXJ0eShzaW5nbGVFdmVudFR5cGUpKSB7XG4gICAgICAgIHRoaXMub2ZmKHNpbmdsZUV2ZW50VHlwZSwgc2VsZWN0b3IsIGhhbmRsZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJMaXN0ID0gbGlzdGVuZXJNYXBbZXZlbnRUeXBlXTtcbiAgaWYgKCFsaXN0ZW5lckxpc3QgfHwgIWxpc3RlbmVyTGlzdC5sZW5ndGgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIFJlbW92ZSBvbmx5IHBhcmFtZXRlciBtYXRjaGVzXG4gIC8vIGlmIHNwZWNpZmllZFxuICBmb3IgKGkgPSBsaXN0ZW5lckxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsaXN0ZW5lciA9IGxpc3RlbmVyTGlzdFtpXTtcblxuICAgIGlmICgoIXNlbGVjdG9yIHx8IHNlbGVjdG9yID09PSBsaXN0ZW5lci5zZWxlY3RvcikgJiYgKCFoYW5kbGVyIHx8IGhhbmRsZXIgPT09IGxpc3RlbmVyLmhhbmRsZXIpKSB7XG4gICAgICBsaXN0ZW5lckxpc3Quc3BsaWNlKGksIDEpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFsbCBsaXN0ZW5lcnMgcmVtb3ZlZFxuICBpZiAoIWxpc3RlbmVyTGlzdC5sZW5ndGgpIHtcbiAgICBkZWxldGUgbGlzdGVuZXJNYXBbZXZlbnRUeXBlXTtcblxuICAgIC8vIFJlbW92ZSB0aGUgbWFpbiBoYW5kbGVyXG4gICAgaWYgKHRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucm9vdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIHRoaXMuaGFuZGxlLCB1c2VDYXB0dXJlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqXG4gKiBIYW5kbGUgYW4gYXJiaXRyYXJ5IGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5oYW5kbGUgPSBmdW5jdGlvbihldmVudCkge1xuICB2YXIgaSwgbCwgdHlwZSA9IGV2ZW50LnR5cGUsIHJvb3QsIHBoYXNlLCBsaXN0ZW5lciwgcmV0dXJuZWQsIGxpc3RlbmVyTGlzdCA9IFtdLCB0YXJnZXQsIC8qKiBAY29uc3QgKi8gRVZFTlRJR05PUkUgPSAnZnRMYWJzRGVsZWdhdGVJZ25vcmUnO1xuXG4gIGlmIChldmVudFtFVkVOVElHTk9SRV0gPT09IHRydWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG5cbiAgLy8gSGFyZGNvZGUgdmFsdWUgb2YgTm9kZS5URVhUX05PREVcbiAgLy8gYXMgbm90IGRlZmluZWQgaW4gSUU4XG4gIGlmICh0YXJnZXQubm9kZVR5cGUgPT09IDMpIHtcbiAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgfVxuXG4gIHJvb3QgPSB0aGlzLnJvb3RFbGVtZW50O1xuXG4gIHBoYXNlID0gZXZlbnQuZXZlbnRQaGFzZSB8fCAoIGV2ZW50LnRhcmdldCAhPT0gZXZlbnQuY3VycmVudFRhcmdldCA/IDMgOiAyICk7XG4gIFxuICBzd2l0Y2ggKHBoYXNlKSB7XG4gICAgY2FzZSAxOiAvL0V2ZW50LkNBUFRVUklOR19QSEFTRTpcbiAgICAgIGxpc3RlbmVyTGlzdCA9IHRoaXMubGlzdGVuZXJNYXBbMV1bdHlwZV07XG4gICAgYnJlYWs7XG4gICAgY2FzZSAyOiAvL0V2ZW50LkFUX1RBUkdFVDpcbiAgICAgIGlmICh0aGlzLmxpc3RlbmVyTWFwWzBdICYmIHRoaXMubGlzdGVuZXJNYXBbMF1bdHlwZV0pIGxpc3RlbmVyTGlzdCA9IGxpc3RlbmVyTGlzdC5jb25jYXQodGhpcy5saXN0ZW5lck1hcFswXVt0eXBlXSk7XG4gICAgICBpZiAodGhpcy5saXN0ZW5lck1hcFsxXSAmJiB0aGlzLmxpc3RlbmVyTWFwWzFdW3R5cGVdKSBsaXN0ZW5lckxpc3QgPSBsaXN0ZW5lckxpc3QuY29uY2F0KHRoaXMubGlzdGVuZXJNYXBbMV1bdHlwZV0pO1xuICAgIGJyZWFrO1xuICAgIGNhc2UgMzogLy9FdmVudC5CVUJCTElOR19QSEFTRTpcbiAgICAgIGxpc3RlbmVyTGlzdCA9IHRoaXMubGlzdGVuZXJNYXBbMF1bdHlwZV07XG4gICAgYnJlYWs7XG4gIH1cblxuICAvLyBOZWVkIHRvIGNvbnRpbnVvdXNseSBjaGVja1xuICAvLyB0aGF0IHRoZSBzcGVjaWZpYyBsaXN0IGlzXG4gIC8vIHN0aWxsIHBvcHVsYXRlZCBpbiBjYXNlIG9uZVxuICAvLyBvZiB0aGUgY2FsbGJhY2tzIGFjdHVhbGx5XG4gIC8vIGNhdXNlcyB0aGUgbGlzdCB0byBiZSBkZXN0cm95ZWQuXG4gIGwgPSBsaXN0ZW5lckxpc3QubGVuZ3RoO1xuICB3aGlsZSAodGFyZ2V0ICYmIGwpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyTGlzdFtpXTtcblxuICAgICAgLy8gQmFpbCBmcm9tIHRoaXMgbG9vcCBpZlxuICAgICAgLy8gdGhlIGxlbmd0aCBjaGFuZ2VkIGFuZFxuICAgICAgLy8gbm8gbW9yZSBsaXN0ZW5lcnMgYXJlXG4gICAgICAvLyBkZWZpbmVkIGJldHdlZW4gaSBhbmQgbC5cbiAgICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBtYXRjaCBhbmQgZmlyZVxuICAgICAgLy8gdGhlIGV2ZW50IGlmIHRoZXJlJ3Mgb25lXG4gICAgICAvL1xuICAgICAgLy8gVE9ETzpNQ0c6MjAxMjAxMTc6IE5lZWQgYSB3YXlcbiAgICAgIC8vIHRvIGNoZWNrIGlmIGV2ZW50I3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvblxuICAgICAgLy8gd2FzIGNhbGxlZC4gSWYgc28sIGJyZWFrIGJvdGggbG9vcHMuXG4gICAgICBpZiAobGlzdGVuZXIubWF0Y2hlci5jYWxsKHRhcmdldCwgbGlzdGVuZXIubWF0Y2hlclBhcmFtLCB0YXJnZXQpKSB7XG4gICAgICAgIHJldHVybmVkID0gdGhpcy5maXJlKGV2ZW50LCB0YXJnZXQsIGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgLy8gU3RvcCBwcm9wYWdhdGlvbiB0byBzdWJzZXF1ZW50XG4gICAgICAvLyBjYWxsYmFja3MgaWYgdGhlIGNhbGxiYWNrIHJldHVybmVkXG4gICAgICAvLyBmYWxzZVxuICAgICAgaWYgKHJldHVybmVkID09PSBmYWxzZSkge1xuICAgICAgICBldmVudFtFVkVOVElHTk9SRV0gPSB0cnVlO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ETzpNQ0c6MjAxMjAxMTc6IE5lZWQgYSB3YXkgdG9cbiAgICAvLyBjaGVjayBpZiBldmVudCNzdG9wUHJvcGFnYXRpb25cbiAgICAvLyB3YXMgY2FsbGVkLiBJZiBzbywgYnJlYWsgbG9vcGluZ1xuICAgIC8vIHRocm91Z2ggdGhlIERPTS4gU3RvcCBpZiB0aGVcbiAgICAvLyBkZWxlZ2F0aW9uIHJvb3QgaGFzIGJlZW4gcmVhY2hlZFxuICAgIGlmICh0YXJnZXQgPT09IHJvb3QpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGwgPSBsaXN0ZW5lckxpc3QubGVuZ3RoO1xuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICB9XG59O1xuXG4vKipcbiAqIEZpcmUgYSBsaXN0ZW5lciBvbiBhIHRhcmdldC5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBsaXN0ZW5lclxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24oZXZlbnQsIHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIGxpc3RlbmVyLmhhbmRsZXIuY2FsbCh0YXJnZXQsIGV2ZW50LCB0YXJnZXQpO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGFuIGVsZW1lbnRcbiAqIG1hdGNoZXMgYSBnZW5lcmljIHNlbGVjdG9yLlxuICpcbiAqIEB0eXBlIGZ1bmN0aW9uKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciBBIENTUyBzZWxlY3RvclxuICovXG52YXIgbWF0Y2hlcyA9IChmdW5jdGlvbihlbCkge1xuICBpZiAoIWVsKSByZXR1cm47XG4gIHZhciBwID0gZWwucHJvdG90eXBlO1xuICByZXR1cm4gKHAubWF0Y2hlcyB8fCBwLm1hdGNoZXNTZWxlY3RvciB8fCBwLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBwLm1vek1hdGNoZXNTZWxlY3RvciB8fCBwLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IHAub01hdGNoZXNTZWxlY3Rvcik7XG59KEVsZW1lbnQpKTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGFuIGVsZW1lbnRcbiAqIG1hdGNoZXMgYSB0YWcgc2VsZWN0b3IuXG4gKlxuICogVGFncyBhcmUgTk9UIGNhc2Utc2Vuc2l0aXZlLFxuICogZXhjZXB0IGluIFhNTCAoYW5kIFhNTC1iYXNlZFxuICogbGFuZ3VhZ2VzIHN1Y2ggYXMgWEhUTUwpLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWdOYW1lIFRoZSB0YWcgbmFtZSB0byB0ZXN0IGFnYWluc3RcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0byB0ZXN0IHdpdGhcbiAqIEByZXR1cm5zIGJvb2xlYW5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hlc1RhZyh0YWdOYW1lLCBlbGVtZW50KSB7XG4gIHJldHVybiB0YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYW4gZWxlbWVudFxuICogbWF0Y2hlcyB0aGUgcm9vdC5cbiAqXG4gKiBAcGFyYW0gez9TdHJpbmd9IHNlbGVjdG9yIEluIHRoaXMgY2FzZSB0aGlzIGlzIGFsd2F5cyBwYXNzZWQgdGhyb3VnaCBhcyBudWxsIGFuZCBub3QgdXNlZFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHRlc3Qgd2l0aFxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5mdW5jdGlvbiBtYXRjaGVzUm9vdChzZWxlY3RvciwgZWxlbWVudCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSovXG4gIGlmICh0aGlzLnJvb3RFbGVtZW50ID09PSB3aW5kb3cpIHJldHVybiBlbGVtZW50ID09PSBkb2N1bWVudDtcbiAgcmV0dXJuIHRoaXMucm9vdEVsZW1lbnQgPT09IGVsZW1lbnQ7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgSUQgb2ZcbiAqIHRoZSBlbGVtZW50IGluICd0aGlzJ1xuICogbWF0Y2hlcyB0aGUgZ2l2ZW4gSUQuXG4gKlxuICogSURzIGFyZSBjYXNlLXNlbnNpdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgVGhlIElEIHRvIHRlc3QgYWdhaW5zdFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHRlc3Qgd2l0aFxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5mdW5jdGlvbiBtYXRjaGVzSWQoaWQsIGVsZW1lbnQpIHtcbiAgcmV0dXJuIGlkID09PSBlbGVtZW50LmlkO1xufVxuXG4vKipcbiAqIFNob3J0IGhhbmQgZm9yIG9mZigpXG4gKiBhbmQgcm9vdCgpLCBpZSBib3RoXG4gKiB3aXRoIG5vIHBhcmFtZXRlcnNcbiAqXG4gKiBAcmV0dXJuIHZvaWRcbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vZmYoKTtcbiAgdGhpcy5yb290KCk7XG59O1xuIiwiLypqc2hpbnQgYnJvd3Nlcjp0cnVlLCBub2RlOnRydWUqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQHByZXNlcnZlIENyZWF0ZSBhbmQgbWFuYWdlIGEgRE9NIGV2ZW50IGRlbGVnYXRvci5cbiAqXG4gKiBAdmVyc2lvbiAwLjMuMFxuICogQGNvZGluZ3N0YW5kYXJkIGZ0bGFicy1qc3YyXG4gKiBAY29weXJpZ2h0IFRoZSBGaW5hbmNpYWwgVGltZXMgTGltaXRlZCBbQWxsIFJpZ2h0cyBSZXNlcnZlZF1cbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChzZWUgTElDRU5TRS50eHQpXG4gKi9cbnZhciBEZWxlZ2F0ZSA9IHJlcXVpcmUoJy4vZGVsZWdhdGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyb290KSB7XG4gIHJldHVybiBuZXcgRGVsZWdhdGUocm9vdCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5EZWxlZ2F0ZSA9IERlbGVnYXRlO1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogV3JhcCBtYXAgZnJvbSBqcXVlcnkuXG4gKi9cblxudmFyIG1hcCA9IHtcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICBjb2w6IFsyLCAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLCAnPC9jb2xncm91cD48L3RhYmxlPiddLFxuICBfZGVmYXVsdDogWzAsICcnLCAnJ11cbn07XG5cbm1hcC50ZCA9XG5tYXAudGggPSBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXTtcblxubWFwLm9wdGlvbiA9XG5tYXAub3B0Z3JvdXAgPSBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXTtcblxubWFwLnRoZWFkID1cbm1hcC50Ym9keSA9XG5tYXAuY29sZ3JvdXAgPVxubWFwLmNhcHRpb24gPVxubWFwLnRmb290ID0gWzEsICc8dGFibGU+JywgJzwvdGFibGU+J107XG5cbm1hcC50ZXh0ID1cbm1hcC5jaXJjbGUgPVxubWFwLmVsbGlwc2UgPVxubWFwLmxpbmUgPVxubWFwLnBhdGggPVxubWFwLnBvbHlnb24gPVxubWFwLnBvbHlsaW5lID1cbm1hcC5yZWN0ID0gWzEsICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCI+JywnPC9zdmc+J107XG5cbi8qKlxuICogUGFyc2UgYGh0bWxgIGFuZCByZXR1cm4gYSBET00gTm9kZSBpbnN0YW5jZSwgd2hpY2ggY291bGQgYmUgYSBUZXh0Tm9kZSxcbiAqIEhUTUwgRE9NIE5vZGUgb2Ygc29tZSBraW5kICg8ZGl2PiBmb3IgZXhhbXBsZSksIG9yIGEgRG9jdW1lbnRGcmFnbWVudFxuICogaW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgY29udGVudHMgb2YgdGhlIGBodG1sYCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWwgLSBIVE1MIHN0cmluZyB0byBcImRvbWlmeVwiXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBkb2MgLSBUaGUgYGRvY3VtZW50YCBpbnN0YW5jZSB0byBjcmVhdGUgdGhlIE5vZGUgZm9yXG4gKiBAcmV0dXJuIHtET01Ob2RlfSB0aGUgVGV4dE5vZGUsIERPTSBOb2RlLCBvciBEb2N1bWVudEZyYWdtZW50IGluc3RhbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sLCBkb2MpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBodG1sKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdHJpbmcgZXhwZWN0ZWQnKTtcblxuICAvLyBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYGRvY3VtZW50YCBvYmplY3RcbiAgaWYgKCFkb2MpIGRvYyA9IGRvY3VtZW50O1xuXG4gIC8vIHRhZyBuYW1lXG4gIHZhciBtID0gLzwoW1xcdzpdKykvLmV4ZWMoaHRtbCk7XG4gIGlmICghbSkgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZShodG1sKTtcblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7IC8vIFJlbW92ZSBsZWFkaW5nL3RyYWlsaW5nIHdoaXRlc3BhY2VcblxuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gIH1cblxuICAvLyB3cmFwIG1hcFxuICB2YXIgd3JhcCA9IG1hcFt0YWddIHx8IG1hcC5fZGVmYXVsdDtcbiAgdmFyIGRlcHRoID0gd3JhcFswXTtcbiAgdmFyIHByZWZpeCA9IHdyYXBbMV07XG4gIHZhciBzdWZmaXggPSB3cmFwWzJdO1xuICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlubmVySFRNTCA9IHByZWZpeCArIGh0bWwgKyBzdWZmaXg7XG4gIHdoaWxlIChkZXB0aC0tKSBlbCA9IGVsLmxhc3RDaGlsZDtcblxuICAvLyBvbmUgZWxlbWVudFxuICBpZiAoZWwuZmlyc3RDaGlsZCA9PSBlbC5sYXN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCk7XG4gIH1cblxuICAvLyBzZXZlcmFsIGVsZW1lbnRzXG4gIHZhciBmcmFnbWVudCA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbC5maXJzdENoaWxkKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCkpO1xuICB9XG5cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuIiwiLyohXG4gICogZG9tcmVhZHkgKGMpIER1c3RpbiBEaWF6IDIwMTQgLSBMaWNlbnNlIE1JVFxuICAqL1xuIWZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uKSB7XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcpIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpXG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JykgZGVmaW5lKGRlZmluaXRpb24pXG4gIGVsc2UgdGhpc1tuYW1lXSA9IGRlZmluaXRpb24oKVxuXG59KCdkb21yZWFkeScsIGZ1bmN0aW9uICgpIHtcblxuICB2YXIgZm5zID0gW10sIGxpc3RlbmVyXG4gICAgLCBkb2MgPSBkb2N1bWVudFxuICAgICwgZG9tQ29udGVudExvYWRlZCA9ICdET01Db250ZW50TG9hZGVkJ1xuICAgICwgbG9hZGVkID0gL15sb2FkZWR8XmMvLnRlc3QoZG9jLnJlYWR5U3RhdGUpXG5cbiAgaWYgKCFsb2FkZWQpXG4gIGRvYy5hZGRFdmVudExpc3RlbmVyKGRvbUNvbnRlbnRMb2FkZWQsIGxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKGRvbUNvbnRlbnRMb2FkZWQsIGxpc3RlbmVyKVxuICAgIGxvYWRlZCA9IDFcbiAgICB3aGlsZSAobGlzdGVuZXIgPSBmbnMuc2hpZnQoKSkgbGlzdGVuZXIoKVxuICB9KVxuXG4gIHJldHVybiBmdW5jdGlvbiAoZm4pIHtcbiAgICBsb2FkZWQgPyBmbigpIDogZm5zLnB1c2goZm4pXG4gIH1cblxufSk7XG4iLCJ2YXIgY2xvbmUgPSByZXF1aXJlKCcuLi91dGlscy9jbG9uZScpO1xuXG4vLyBDcmVhdGVzIGEgYm9hcmQgb2YgYHNpemVgXG4vLyBUaGUgY2VsbHMgYXJlIGEgdmVjdG9yIG9mIHZlY3RvcnNcbnZhciBCb2FyZCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2l6ZSkge1xuICB2YXIgY2VsbHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGk8c2l6ZTsgaSsrKSB7XG4gICAgY2VsbHMucHVzaChbXSk7XG4gICAgZm9yICh2YXIgaiA9IDA7IGo8c2l6ZTsgaisrKVxuICAgICAgY2VsbHNbaV0ucHVzaChCb2FyZC5DaGlwcy5FTVBUWSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzaXplOiBzaXplLFxuICAgIGNlbGxzOiBjZWxsc1xuICB9XG59O1xuXG5Cb2FyZC5DaGlwcyA9IHtcbiAgRU1QVFk6ICcgJyxcbiAgQkxVRTogJ08nLFxuICBSRUQ6ICdYJ1xufTtcblxuXG5Cb2FyZC5nZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgYikge1xuICByZXR1cm4gYi5jZWxsc1tyb3ddW2NvbF07XG59O1xuXG5Cb2FyZC5zZXQgPSBmdW5jdGlvbihyb3csIGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBuYi5jZWxsc1tyb3ddW2NvbF0gPSB2YWw7XG4gIHJldHVybiBuYjtcbn07XG5cbkJvYXJkLnB1dCA9IGZ1bmN0aW9uKGNvbCwgdmFsLCBiKSB7XG4gIHZhciBuYiA9IGNsb25lKGIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5iLnNpemU7IGkrKykge1xuICAgIHZhciByb3cgPSBuYi5jZWxsc1tpXTtcbiAgICBpZiAocm93W2NvbF0gPT09IEJvYXJkLkNoaXBzLkVNUFRZKSB7XG4gICAgICByb3dbY29sXSA9IHZhbDtcbiAgICAgIHJldHVybiBuYjtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdDb2x1bW4nLCBjb2wsICdpcyBmdWxsIGluIGJvYXJkJywgYik7XG59O1xuXG5Cb2FyZC5pc0Z1bGwgPSBmdW5jdGlvbihib2FyZCkge1xuICB2YXIgaSwgaiwgcm93O1xuICBmb3IgKGkgPSAwOyBpIDwgYm9hcmQuc2l6ZTsgaSsrKVxuICAgIGZvciAocm93ID0gYm9hcmQuY2VsbHNbaV0sIGogPSAwOyBqIDwgYm9hcmQuc2l6ZTsgaisrKVxuICAgICAgaWYgKHJvd1tqXSA9PT0gQm9hcmQuQ2hpcHMuRU1QVFkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBnaXZlbiBhbiBpbmRleCB3aWxsIHRlbGwgeW91IGlmIHlvdSBzaG91bGQgY2hlY2sgaXRcbi8vIGZvciA0IGluIGxpbmUgZGVwZW5kaW5nIG9uIHRoZSBib2FyZCBzaXplLlxuZnVuY3Rpb24gc2hvdWxkQ2hlY2soYm9hcmQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGlkeCkge1xuICAgIHJldHVybiBpZHggPD0gYm9hcmQuc2l6ZSAtIDQ7XG4gIH07XG59XG5cbi8vIERldGVjdHMgNCBpbiBsaW5lIGluIGEgYm9hcmQuXG4vLyBSZXR1cm5zIG51bGwgaWYgdGhlcmUgaXMgbm9uZS5cbi8vIFJldHVybnMgeyBob3c6IFRZUEUsIHdoZXJlOiBbUk9XLCBDT0xdIH0gd2hlbiBpdCBmaW5kcyBvbmVcbi8vIFByZXR0eSBoYWlyeSBjb2RlLCBidXQgd2VsbCB0ZXN0ZWQuXG5Cb2FyZC5oYXNGb3VySW5saW5lID0gZnVuY3Rpb24oYm9hcmQpIHtcblxuICAvLyBDaGVjayBpZHggd2lsbCBiZSB1c2VkIHRvIHNlZSBpZiB3ZSBzaG91bGQgdHJ5IGFuZCBmaW5kIDQgaW4gbGluZSBvblxuICAvLyBhIHBhcnRpY3VsYXIgaW5kZXggKGlmIGl0IHdvdWxkIGZpdCBmcm9tIHRoYXQgaW5kZXggdG8gdGhlIGJvYXJkIHNpemUpXG4gIHZhciBjaGVja0lkeCA9IHNob3VsZENoZWNrKGJvYXJkKTtcblxuICBmb3IgKHZhciByb3dJZHggPSAwOyByb3dJZHggPCA3OyByb3dJZHgrKykge1xuICAgIHZhciByb3cgPSBib2FyZC5jZWxsc1tyb3dJZHhdO1xuICAgIGZvciAodmFyIGNvbElkeCA9IDA7IGNvbElkeCA8IDc7IGNvbElkeCsrKSB7XG5cbiAgICAgIC8vIFdlIGFyZSBnb2luZyB0byBnbyB0aHJvdWdoIGV2ZXJ5IGNlbGwgaW4gdGhlIGJvYXJkLCBhbmQgd2lsbCB0cnkgdG9cbiAgICAgIC8vIGZpbmQgNCBkaWZmZXJlbnQgdHlwZXMgb2YgNCBpbiBsaW5lIGZyb20gdGhlIGluaXRpYWwgY2VsbC5cbiAgICAgIHZhciBjdXJyZW50Q2hpcCA9IHJvd1tjb2xJZHhdO1xuICAgICAgLy8gRm9yIHRoZSBkb3dud2FyZHMgZGlhZ29uYWwgd2Ugd2lsbCBjaGVjayBmcm9tIDQgdXAgb2YgdGhlIGN1cnJlbnQgY2VsbFxuICAgICAgLy8gdG8gNCByaWdodCBvZiB0aGUgY3VycmVudCBjZWxsLlxuICAgICAgdmFyIGluaURvd25EaWFnID0gIGNoZWNrSWR4KHJvd0lkeCszKSAmJiBib2FyZC5jZWxsc1tyb3dJZHgrM11bY29sSWR4XTtcblxuICAgICAgLy8gV2UgYXJlIGdvaW5nIHRvIGNhbGN1bGF0ZSB0aGUgaW5pdGlhbCB2YWx1ZXMgb2YgdGhlIGJvb2xlYW5zIHdlIHdpbGxcbiAgICAgIC8vIHVzZSB0byBzZWUgaWYgdGhlcmUgd2FzIDQgaW4gbGluZSB0aGF0IHBhcnRpY3VsYXIgd2F5LlxuXG4gICAgICAvLyBWYWxpZCBpbml0aWFsIGNlbGxzIHNob3VsZCBub3QgYmUgRU1QVFkuIElmIGVtcHR5IG5vIDQgaW4gbGluZVxuICAgICAgdmFyIHZhbFZhbGlkID0gdHJ1ZSAmJiBjdXJyZW50Q2hpcCAhPT0gQm9hcmQuQ2hpcHMuRU1QVFk7XG4gICAgICB2YXIgZG93bkRpYWdWYWxpZCA9IHRydWUgJiYgaW5pRG93bkRpYWcgIT09IEJvYXJkLkNoaXBzLkVNUFRZO1xuXG4gICAgICAvLyBUaGVzZSBhcmUgdGhlIGluaXRpYWwgdmFsdWVzIGZvciB0aGUgZGlmZmVyZW50IHR5cGVzIG9mIDQgaW4gbGluZS5cbiAgICAgIC8vIEZvciBlYWNoIHR5cGUgb2YgZGlhZ29uYWwsIHRoZSBpbml0aWFsIHZhbHVlIHdpbGwgYmUgaWYgaXQgaXMgcG9zc2libGVcbiAgICAgIC8vIHRvIGhhdmUgNCBpbiBsaW5lIHRoZXJlICh3b24ndCBnbyBvdXQgb2YgYm91bmRzIHdoZW4gc2VhcmNoaW5nLCBhbmRcbiAgICAgIC8vIHRoZSBjZWxsIGhhcyBhIHZhbGlkIHBsYXllciBjaGlwIG9uIGl0KVxuICAgICAgdmFyIGNhbkJlSG9yaXpvbnRhbCA9IHZhbFZhbGlkICAgICAgJiYgY2hlY2tJZHgoY29sSWR4KTtcbiAgICAgIHZhciBjYW5CZVZlcnRpY2FsICAgPSB2YWxWYWxpZCAgICAgICYmIGNoZWNrSWR4KHJvd0lkeCk7XG4gICAgICB2YXIgY2FuQmVVcERpYWcgICAgID0gdmFsVmFsaWQgICAgICAmJiBjaGVja0lkeChyb3dJZHgpICAmJiBjaGVja0lkeChjb2xJZHgpO1xuICAgICAgdmFyIGNhbkJlRG93bkRpYWcgICA9IGRvd25EaWFnVmFsaWQgJiYgY2hlY2tJZHgocm93SWR4KSAgJiYgY2hlY2tJZHgoY29sSWR4KTtcblxuICAgICAgdmFyIGhvcml6b250YWwgPSBjYW5CZUhvcml6b250YWw7XG4gICAgICB2YXIgdmVydGljYWwgICA9IGNhbkJlVmVydGljYWw7XG4gICAgICB2YXIgdXBkaWFnICAgICA9IGNhbkJlVXBEaWFnO1xuICAgICAgdmFyIGRvd25kaWFnICAgPSBjYW5CZURvd25EaWFnO1xuXG4gICAgICAvLyBXaGVuIHRoZXJlIGV4aXN0cyB0aGUgcG9zc2liaWxpdHkgb2YgYW55IDQgaW4gbGluZSwgZ28gY2hlY2tcbiAgICAgIGlmIChjYW5CZUhvcml6b250YWwgfHwgY2FuQmVWZXJ0aWNhbCB8fCBjYW5CZVVwRGlhZyB8fCBjYW5CZURvd25EaWFnKSB7XG5cbiAgICAgICAgLy8gTGV0cyBnbyB0aHJvdWdoIHRoZSBvdGhlciAzIGNlbGxzIGZvciBlYWNoIGtpbmQgb2YgNCBpbiBsaW5lIGFuZCBzZWVcbiAgICAgICAgLy8gaWYgdGhleSBtYXRjaC4gV2Ugd2lsbCBzaG9ydGNpcmN1aXQgdG8gZmFsc2UgYXMgc29vbiBhcyBwb3NzaWJsZS5cbiAgICAgICAgZm9yICh2YXIgayA9IDE7IGsgPCA0OyBrKyspIHtcblxuICAgICAgICAgIC8vIEZvciBob3Jpem9udGFsLCB3ZSBjaGVjayB0byB0aGUgcmlnaHRcbiAgICAgICAgICBob3Jpem9udGFsID0gaG9yaXpvbnRhbCAmJiBjdXJyZW50Q2hpcCA9PT0gcm93W2NvbElkeCtrXTtcblxuICAgICAgICAgIC8vIEZvciB2ZXJ0aWNhbCwgd2UgY2hlY2sgdG8gdGhlIHVwd2FyZHMgbWFpbnRhaW5pbmcgY29sdW1uXG4gICAgICAgICAgdmVydGljYWwgPSB2ZXJ0aWNhbCAmJiBjdXJyZW50Q2hpcCA9PT0gYm9hcmQuY2VsbHNbcm93SWR4K2tdW2NvbElkeF07XG5cbiAgICAgICAgICAvLyBGb3IgdXB3YXJkcyBkaWFnb25hbCwgd2UgY2hlY2sgcmlnaHQgYW5kIHVwXG4gICAgICAgICAgdXBkaWFnID0gdXBkaWFnICYmIGN1cnJlbnRDaGlwID09PSBib2FyZC5jZWxsc1tyb3dJZHgra11bY29sSWR4K2tdO1xuXG4gICAgICAgICAgLy8gRm9yIGRvd253YXJkcyBkaWFnb25hbCwgd2UgZ28gZnJvbSB1cC1sZWZ0IHRvIGJvdHRvbS1yaWdodFxuICAgICAgICAgIGRvd25kaWFnID0gZG93bmRpYWcgJiYgaW5pRG93bkRpYWcgPT09IGJvYXJkLmNlbGxzW3Jvd0lkeCszLWtdW2NvbElkeCtrXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gZG9uZSBjaGVja2luZywgd2Ugc2F2ZSB0aGUgcG9zaXRpb24sIGFuZCBzZWUgaWYgYW55IG9mIHRoZSA0IGluXG4gICAgICAgIC8vIGxpbmVzIGhhcyBtYXRjaGVkICh0cnVlKSwgYW5kIHJldHVybiB0aGUgNCBpbmxpbmUgYW5kIGV4aXQgdGhlXG4gICAgICAgIC8vIGZ1bmN0aW9uXG4gICAgICAgIHZhciBob3cgPSBudWxsO1xuICAgICAgICB2YXIgd2hlcmUgPSBbcm93SWR4LCBjb2xJZHhdO1xuICAgICAgICBpZiAoaG9yaXpvbnRhbCkgaG93ID0gJ0hPUklaT05UQUwnO1xuICAgICAgICBpZiAodmVydGljYWwpICAgaG93ID0gJ1ZFUlRJQ0FMJztcbiAgICAgICAgaWYgKHVwZGlhZykgICAgIGhvdyA9ICdVUERJQUdPTkFMJztcbiAgICAgICAgaWYgKGRvd25kaWFnKSB7IGhvdyA9ICdET1dORElBR09OQUwnOyB3aGVyZSA9IFtyb3dJZHgrMywgY29sSWR4XTsgfVxuXG4gICAgICAgIGlmIChob3cpIHJldHVybiB7IGhvdzogaG93LCB3aGVyZTogd2hlcmUgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuIiwiXG52YXIgQm9hcmQgPSByZXF1aXJlKCcuL2JvYXJkJyk7XG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXInKTtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJy4uL3V0aWxzL2Nsb25lJyk7XG5cbi8vIEdhbWUgc3RhdGVzLiBCTFVFIGFuZCBSRUQgYXJlIGZvciBlYWNoIHBsYXllcnMgdHVyblxudmFyIFN0YXRlcyA9IGV4cG9ydHMuU3RhdGVzID0ge1xuICBJTklUOiAnSU5JVCcsXG4gIEJMVUU6ICdCTFVFJyxcbiAgUkVEOiAnUkVEJyxcbiAgR0FNRU9WRVI6ICdHQU1FT1ZFUidcbn07XG5cbmV4cG9ydHMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHBsYXllcnM6IHsgYmx1ZTogJycsIHJlZDogJycgfSxcbiAgICBib2FyZDogQm9hcmQoNyksXG4gICAgc3RhdGU6IFN0YXRlcy5JTklUXG4gIH07XG59O1xuXG5leHBvcnRzLnN0YXJ0ID0gZnVuY3Rpb24ocGxheWVyMSwgcGxheWVyMiwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLklOSVQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5cXCd0IHN0YXJ0IGEgZ2FtZSB0aGF0IGlzIG5vdCBuZXcnKTtcbiAgaWYgKCFQbGF5ZXIudmFsaWQocGxheWVyMSkgfHwgIVBsYXllci52YWxpZChwbGF5ZXIyKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvbWUgcGxheWVyIG5hbWVzIGFyZSBub3QgdmFsaWQuJywgcGxheWVyMSwgcGxheWVyMik7XG5cbiAgdmFyIHN0YXJ0ZWQgPSBjbG9uZShnYW1lKTtcbiAgc3RhcnRlZC5wbGF5ZXJzLmJsdWUgPSBwbGF5ZXIxO1xuICBzdGFydGVkLnBsYXllcnMucmVkID0gcGxheWVyMjtcbiAgc3RhcnRlZC5zdGF0ZSA9IFN0YXRlcy5CTFVFO1xuICByZXR1cm4gc3RhcnRlZDtcbn07XG5cbmV4cG9ydHMucGxheSA9IGZ1bmN0aW9uKGNvbCwgZ2FtZSkge1xuICBpZiAoZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLkJMVUUgJiYgZ2FtZS5zdGF0ZSAhPT0gU3RhdGVzLlJFRClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW4gb25seSBwbGF5IHdoZW4gdGhlIGdhbWUgaXMgcnVubmluZycpXG5cbiAgdmFyIHBsYXllZCA9IGNsb25lKGdhbWUpO1xuICBwbGF5ZWQuYm9hcmQgPSBCb2FyZC5wdXQoY29sLCBCb2FyZC5DaGlwc1twbGF5ZWQuc3RhdGVdLCBwbGF5ZWQuYm9hcmQpO1xuXG4gIHZhciBmb3VySW5saW5lID0gQm9hcmQuaGFzRm91cklubGluZShwbGF5ZWQuYm9hcmQpO1xuICBpZiAoZm91cklubGluZSkge1xuICAgIHJldHVybiB3aW4oZm91cklubGluZSwgcGxheWVkKTtcbiAgfVxuXG4gIGlmIChCb2FyZC5pc0Z1bGwocGxheWVkLmJvYXJkKSkge1xuICAgIHJldHVybiBnYW1lT3ZlcihwbGF5ZWQpO1xuICB9XG5cbiAgcmV0dXJuIHN3aXRjaFR1cm4ocGxheWVkKTtcbn07XG5cbmZ1bmN0aW9uIHN3aXRjaFR1cm4oZ2FtZSkge1xuICB2YXIgdHVybiA9IGdhbWUuc3RhdGUgPT09IFN0YXRlcy5CTFVFID8gU3RhdGVzLlJFRCA6IFN0YXRlcy5CTFVFO1xuICBnYW1lLnN0YXRlID0gdHVybjtcbiAgcmV0dXJuIGdhbWU7XG59XG5cbmZ1bmN0aW9uIGdhbWVPdmVyKGdhbWUpIHtcbiAgdmFyIG92ZXIgPSBjbG9uZShnYW1lKTtcbiAgb3Zlci5zdGF0ZSA9IFN0YXRlcy5HQU1FT1ZFUjtcbiAgcmV0dXJuIG92ZXI7XG59XG5cbmZ1bmN0aW9uIHdpbihmb3VySW5saW5lLCBnYW1lKSB7XG4gIHZhciB3b24gPSBjbG9uZShnYW1lKTtcbiAgd29uLndpbm5lciA9IGdhbWUuc3RhdGU7XG4gIHdvbi5zdGF0ZSA9IFN0YXRlcy5HQU1FT1ZFUjtcbiAgd29uLmxpbmUgPSBmb3VySW5saW5lO1xuICByZXR1cm4gd29uO1xufVxuXG5leHBvcnRzLnByaW50ID0gZnVuY3Rpb24oZykge1xuICBjb25zb2xlLmxvZygnICcsIGcuc3RhdGUsICd3aW5uZXI6JywgZy53aW5uZXIsXG4gICAgICAgICAgICAgICdsaW5lOicsIGcubGluZSAmJiBnLmxpbmUuaG93LCBnLmxpbmUgJiYgZy5saW5lLndoZXJlLmpvaW4oJywgJykpO1xuICBjb25zb2xlLmxvZyhcbiAgICBnLmJvYXJkLmNlbGxzLm1hcChmdW5jdGlvbihyKSB7XG4gICAgICByZXR1cm4gWycnXS5jb25jYXQocikuY29uY2F0KFsnJ10pLmpvaW4oJ3wnKTtcbiAgICB9KS5yZXZlcnNlKCkuam9pbignXFxuJylcbiAgKTtcbiAgY29uc29sZS5sb2coZyk7XG59O1xuXG5mdW5jdGlvbiBnZXRQbGF5ZXIoc3RhdGUsIGdhbWUpIHtcbiAgcmV0dXJuIGdhbWUucGxheWVyc1tzdGF0ZS50b0xvd2VyQ2FzZSgpXVxufVxuXG5leHBvcnRzLmN1cnJlbnRQbGF5ZXIgPSBmdW5jdGlvbihnYW1lKSB7XG4gIHJldHVybiBnZXRQbGF5ZXIoZ2FtZS5zdGF0ZSwgZ2FtZSk7XG59O1xuXG5leHBvcnRzLndpbm5lciA9IGZ1bmN0aW9uKGdhbWUpIHtcbiAgcmV0dXJuIGdldFBsYXllcihnYW1lLndpbm5lciwgZ2FtZSk7XG59O1xuXG5leHBvcnRzLmxvb3NlciA9IGZ1bmN0aW9uKGdhbWUpIHtcbiAgdmFyIHcgPSBleHBvcnRzLndpbm5lcihnYW1lKTtcbiAgcmV0dXJuIGdhbWUucGxheWVycy5ibHVlID09PSB3ID8gZ2FtZS5wbGF5ZXJzLnJlZCA6IGdhbWUucGxheWVycy5ibHVlO1xufTtcbiIsIlxuZXhwb3J0cy52YWxpZCA9IGZ1bmN0aW9uKHBsYXllcikge1xuICByZXR1cm4gdHlwZW9mIHBsYXllciA9PT0gJ3N0cmluZycgJiYgcGxheWVyICE9PSAnJztcbn07XG4iLCJcbnZhciBVSSA9IHJlcXVpcmUoJy4vdWknKTtcblxuVUkuaW5pdCgnY29ubmVjdDQnKTtcbiIsIlxudmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xuXG5cbnZhciBDb25uZWN0NCA9IHJlcXVpcmUoJy4uL2dhbWUnKTtcblxudmFyIEdhbWVPdmVyID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNjcmVlbjogZG9taWZ5KFwiPGRpdiBjbGFzcz0nZ2FtZS1vdmVyJz5cXG4gIDxoMj5Db25ncmF0dWxhdGlvbnMgPHNwYW4gY2xhc3M9J3dpbm5lcic+PC9zcGFuPjwvaDI+XFxuICA8aDQ+TWF5YmUgbmV4dCB0aW1lIDxzcGFuIGNsYXNzPSdsb29zZXInPjwvc3Bhbj4gOig8L2g0PlxcbiAgPGJ1dHRvbiBjbGFzcz0ncmVzdGFydCc+VHJ5IGFnYWluPzwvYnV0dG9uPlxcbjwvZGl2PlxcblwiKVxufTtcblxuR2FtZU92ZXIuaW5pdCA9IGZ1bmN0aW9uKHVpLCByZXN0YXJ0KSB7XG4gIHVpLmRvbS5hcHBlbmRDaGlsZChHYW1lT3Zlci5zY3JlZW4uY2xvbmVOb2RlKHRydWUpKTtcblxuICB2YXIgc2NyZWVuID0ge1xuICAgIHdpbm5lcjogdWkuZG9tLnF1ZXJ5U2VsZWN0b3IoJy53aW5uZXInKSxcbiAgICBsb29zZXI6IHVpLmRvbS5xdWVyeVNlbGVjdG9yKCcubG9vc2VyJyksXG4gIH07XG5cbiAgc2NyZWVuLndpbm5lci50ZXh0Q29udGVudCA9IENvbm5lY3Q0Lndpbm5lcih1aS5nYW1lKTtcbiAgc2NyZWVuLmxvb3Nlci50ZXh0Q29udGVudCA9IENvbm5lY3Q0Lmxvb3Nlcih1aS5nYW1lKTtcblxuICB1aS5ldmVudHMub24oJ2NsaWNrJywgJy5yZXN0YXJ0JywgcmVzdGFydC5iaW5kKG51bGwsIHVpKSk7XG5cbiAgcmV0dXJuIHNjcmVlbjtcbn07XG5cbiIsInZhciBkb21pZnkgPSByZXF1aXJlKCdkb21pZnknKTtcblxuXG52YXIgQ29ubmVjdDQgPSByZXF1aXJlKCcuLi9nYW1lJyk7XG5cbnZhciBHYW1lID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNjcmVlbjogZG9taWZ5KFwiXFxuPHAgY2xhc3M9J3R1cm4nPlxcbkl0IGlzIDxzcGFuPjwvc3Bhbj4ncyB0dXJuXFxuPC9wPlxcbjxkaXYgY2xhc3M9J2JvYXJkJz5cXG4gIDxkaXYgY2xhc3M9J2NlbGwnPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuPHAgY2xhc3M9J21zZyc+PC9wPlxcblwiKVxufTtcblxuR2FtZS5pbml0ID0gZnVuY3Rpb24odWksIHBsYXkpIHtcbiAgdWkuZG9tLmFwcGVuZENoaWxkKEdhbWUuc2NyZWVuLmNsb25lTm9kZSh0cnVlKSk7XG5cbiAgdmFyIHNjcmVlbiA9IHtcbiAgICBjZWxsOiB1aS5kb20ucXVlcnlTZWxlY3RvcignLmNlbGwnKSxcbiAgICBib2FyZDogdWkuZG9tLnF1ZXJ5U2VsZWN0b3IoJy5ib2FyZCcpLFxuICAgIG5hbWU6IHVpLmRvbS5xdWVyeVNlbGVjdG9yKCcudHVybj5zcGFuJylcbiAgfTtcblxuICBHYW1lLnJlbmRlcihzY3JlZW4sIHVpKTtcblxuICB1aS5ldmVudHMub24oJ2NsaWNrJywgJy5jZWxsJywgZnVuY3Rpb24oZXYsIGNlbGwpIHtcbiAgICB2YXIgcm93ID0gY2VsbC5kYXRhc2V0LnJvdztcbiAgICB2YXIgY29sID0gY2VsbC5kYXRhc2V0LmNvbDtcbiAgICBwbGF5KHJvdywgY29sLCB1aSk7XG4gIH0pO1xuXG4gIHJldHVybiBzY3JlZW47XG59O1xuXG5HYW1lLmRyYXdCb2FyZCA9IGZ1bmN0aW9uKHNjcmVlbiwgYm9hcmQpIHtcbiAgLy8gQ2xlYW4gYm9hcmRcbiAgc2NyZWVuLmJvYXJkLmlubmVySFRNTCA9ICcnO1xuICB2YXIgZG9tQm9hcmQgPSBib2FyZC5jZWxscy5tYXAoZnVuY3Rpb24ocm93LCByKSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoY2VsbFRvRG9tLmJpbmQobnVsbCwgc2NyZWVuLmNlbGwsIHIpKTtcbiAgfSk7XG5cbiAgZG9tQm9hcmQucmV2ZXJzZSgpLmZvckVhY2goZnVuY3Rpb24gKHJvdywgaSkge1xuICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjZWxsLCBqKSB7XG4gICAgICBzY3JlZW4uYm9hcmQuYXBwZW5kQ2hpbGQoY2VsbCk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gY2VsbFRvRG9tKGNlbGxEb20sIHJvdywgY2VsbCwgY29sKSB7XG4gIHZhciBuYyA9IGNlbGxEb20uY2xvbmVOb2RlKHRydWUpO1xuICBuYy5kYXRhc2V0LnJvdyA9IHJvdztcbiAgbmMuZGF0YXNldC5jb2wgPSBjb2w7XG4gIG5jLnRleHRDb250ZW50ID0gY2VsbDtcbiAgcmV0dXJuIG5jO1xufVxuXG5HYW1lLmRyYXdUdXJuID0gZnVuY3Rpb24oc2NyZWVuLCB1aSkge1xuICBzY3JlZW4ubmFtZS50ZXh0Q29udGVudCA9IENvbm5lY3Q0LmN1cnJlbnRQbGF5ZXIodWkuZ2FtZSk7XG59O1xuXG5HYW1lLnJlbmRlciA9IGZ1bmN0aW9uKHNjcmVlbiwgdWkpIHtcbiAgR2FtZS5kcmF3VHVybihzY3JlZW4sIHVpKTtcbiAgR2FtZS5kcmF3Qm9hcmQoc2NyZWVuLCB1aS5nYW1lLmJvYXJkKTtcbn07XG5cbiIsIlxudmFyIGRvbXJlYWR5ID0gcmVxdWlyZSgnZG9tcmVhZHknKTtcbnZhciBkZWxlZ2F0ZSA9IHJlcXVpcmUoJ2RvbS1kZWxlZ2F0ZScpO1xuXG52YXIgQ29ubmVjdDQgPSByZXF1aXJlKCcuLi9nYW1lJyk7XG5cbnZhciBJbml0aWFsID0gcmVxdWlyZSgnLi9pbml0aWFsJyk7XG52YXIgR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpO1xudmFyIEdhbWVPdmVyID0gcmVxdWlyZSgnLi9nYW1lLW92ZXInKTtcblxuZXhwb3J0cy5pbml0ID0gZnVuY3Rpb24oaWQpIHtcbiAgZG9tcmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuXG4gICAgdmFyIHVpID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgZG9tOiBkb20sXG4gICAgICBnYW1lOiBDb25uZWN0NC5pbml0KCksXG4gICAgICBldmVudHM6IGRlbGVnYXRlKGRvbSksXG4gICAgICB2aWV3czoge1xuICAgICAgICBpbml0aWFsOiBudWxsLFxuICAgICAgICBnYW1lOiBudWxsLFxuICAgICAgICBnYW1lT3ZlcjogbnVsbFxuICAgICAgfVxuICAgIH07XG5cbiAgICB1aS52aWV3cy5pbml0aWFsID0gSW5pdGlhbC5pbml0KHVpLCBzdGFydEdhbWUpO1xuXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoYmx1ZSwgcmVkLCB1aSkge1xuICB0cnkge1xuICAgIHVpLmdhbWUgPSBDb25uZWN0NC5zdGFydChibHVlLCByZWQsIHVpLmdhbWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGUubWVzc2FnZTtcbiAgfVxuXG4gIGNsZWFuU2NyZWVuKHVpKTtcbiAgdWkudmlld3MuZ2FtZSA9IEdhbWUuaW5pdCh1aSwgdXNlclBsYXlzKTtcbn1cblxuZnVuY3Rpb24gdXNlclBsYXlzKHJvdywgY29sLCB1aSkge1xuICB1aS5nYW1lID0gQ29ubmVjdDQucGxheShjb2wsIHVpLmdhbWUpO1xuICBHYW1lLnJlbmRlcih1aS52aWV3cy5nYW1lLCB1aSk7XG4gIGlmICh1aS5nYW1lLnN0YXRlID09PSBDb25uZWN0NC5TdGF0ZXMuR0FNRU9WRVIpXG4gICAgZ2FtZUZpbmlzaGVkKHVpKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUZpbmlzaGVkKHVpKSB7XG4gIHVpLnZpZXdzLmdhbWVPdmVyID0gR2FtZU92ZXIuaW5pdCh1aSwgcmVzdGFydCk7XG59XG5cbmZ1bmN0aW9uIHJlc3RhcnQodWkpIHtcbiAgY2xlYW5TY3JlZW4odWkpO1xuICB1aS5ldmVudHMub2ZmKCk7XG4gIGV4cG9ydHMuaW5pdCh1aS5pZCk7XG59XG5cbmZ1bmN0aW9uIGNsZWFuU2NyZWVuKHVpKSB7XG4gIHVpLmRvbS5pbm5lckhUTUwgPSAnJztcbn1cblxuIiwidmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xuXG5cbnZhciBJbml0aWFsID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNjcmVlbjogZG9taWZ5KFwiPGRpdiBjbGFzcz1cXFwid2VsY29tZVxcXCI+XFxuICA8cD5XZWxjb21lIHRvIGNvbm5lY3Q0PC9wPlxcbiAgPHA+Q2hvb3NlIHRoZSBuYW1lIG9mIHRoZSBwbGF5ZXJzPC9wPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInBsYXllck5hbWVzXFxcIj5cXG4gIDxpbnB1dCB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0ncGxheWVyMScgLz5cXG4gIDxpbnB1dCB0eXBlPSd0ZXh0JyBwbGFjZWhvbGRlcj0ncGxheWVyMicgLz5cXG4gIDxidXR0b24+U3RhcnQgZ2FtZTwvYnV0dG9uPlxcbiAgPHNwYW4gY2xhc3M9J21zZyc+PC9zcGFuPlxcbjwvZGl2PlxcblwiKVxufTtcblxuSW5pdGlhbC5pbml0ID0gZnVuY3Rpb24odWksIGRvbmUpIHtcbiAgdWkuZG9tLmFwcGVuZENoaWxkKEluaXRpYWwuc2NyZWVuLmNsb25lTm9kZSh0cnVlKSk7XG5cbiAgdmFyIHNjcmVlbiA9IHtcbiAgICBpbnB1dHM6IHVpLmRvbS5xdWVyeVNlbGVjdG9yQWxsKCcucGxheWVyTmFtZXMgaW5wdXQnKSxcbiAgICBtc2c6IHVpLmRvbS5xdWVyeVNlbGVjdG9yKCcucGxheWVyTmFtZXMgc3Bhbi5tc2cnKVxuICB9O1xuXG4gIHVpLmV2ZW50cy5vbignY2xpY2snLCAnLnBsYXllck5hbWVzIGJ1dHRvbicsIHNldFBsYXllcnMuYmluZChudWxsLCBzY3JlZW4sIHVpLCBkb25lKSk7XG59O1xuXG5mdW5jdGlvbiBzZXRQbGF5ZXJzKHNjcmVlbiwgdWksIGRvbmUpIHtcbiAgdmFyIGJsdWUgPSBzY3JlZW4uaW5wdXRzWzBdLnZhbHVlO1xuICB2YXIgcmVkID0gc2NyZWVuLmlucHV0c1sxXS52YWx1ZTtcbiAgaWYgKCFibHVlIHx8ICFyZWQpIHtcbiAgICBzY3JlZW4ubXNnLnRleHRDb250ZW50ID0gJ0V2ZXJ5IHBsYXllciBuZWVkcyBhIG5hbWUhJztcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcmVzID0gZG9uZShibHVlLCByZWQsIHVpKTtcbiAgaWYgKHR5cGVvZiByZXMgPT09ICdzdHJpbmcnKVxuICAgIHNjcmVlbi5tc2cudGV4dENvbnRlbnQgPSByZXM7XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oanMpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoanMpKTtcbn07XG4iXX0=
