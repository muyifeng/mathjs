var Node = require('./Node');

/**
 * @constructor OperatorNode
 * @extends {Node}
 * An operator with two arguments, like 2+3
 *
 * @param {String} op       Operator name, for example '+'
 * @param {String} fn       Function name, for example 'add'
 * @param {Node[]} params   Parameters
 */
function OperatorNode (op, fn, params) {
  if (!(this instanceof OperatorNode)) {
    throw new SyntaxError('Constructor must be called with the new operator');
  }

  // TODO: validate input
  this.op = op;
  this.fn = fn;
  this.params = params;
}

OperatorNode.prototype = new Node();

/**
 * Compile the node to javascript code
 * @param {Object} defs     Object which can be used to define functions
 *                          or constants globally available for the compiled
 *                          expression
 * @return {String} js
 * @private
 */
OperatorNode.prototype._compile = function (defs) {
  if (!(this.fn in defs.math)) {
    throw new Error('Function ' + this.fn + ' missing in provided namespace "math"');
  }

  var params = this.params.map(function (param) {
    return param._compile(defs);
  });
  return 'math.' + this.fn + '(' + params.join(', ') + ')';
};

/**
 * Find all nodes matching given filter
 * @param {Object} filter  See Node.find for a description of the filter settings
 * @returns {Node[]} nodes
 */
OperatorNode.prototype.find = function (filter) {
  var nodes = [];

  // check itself
  if (this.match(filter)) {
    nodes.push(this);
  }

  // search in parameters
  var params = this.params;
  if (params) {
    for (var i = 0, len = params.length; i < len; i++) {
      nodes = nodes.concat(params[i].find(filter));
    }
  }

  return nodes;
};

/**
 * Get string representation
 * @return {String} str
 */
OperatorNode.prototype.toString = function() {
  var params = this.params;

  switch (params.length) {
    case 1:
      if (this.op == '-') {
        // special case: unary minus
        return '-' + params[0].toString();
      }
      else {
        // for example '5!'
        return params[0].toString() + this.op;
      }

    case 2: // for example '2+3'
      var lhs = params[0].toString();
      if (params[0] instanceof OperatorNode) {
        lhs = '(' + lhs + ')';
      }
      var rhs = params[1].toString();
      if (params[1] instanceof OperatorNode) {
        rhs = '(' + rhs + ')';
      }
      return lhs + ' ' + this.op + ' ' + rhs;

    default: // this should not occur. format as a function call
      return this.op + '(' + this.params.join(', ') + ')';
  }
};

module.exports = OperatorNode;
