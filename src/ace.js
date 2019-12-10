import ace from 'ace-builds';
import 'ace-builds/webpack-resolver';


ace.define('ace/mode/ttk91', (require, exports, module) => {
  var oop = require('ace/lib/oop');
  var TextMode = require('ace/mode/text').Mode;

  var TTK91HighlightRules = require('ace/mode/ttk91_highlight_rules').TTK91HighlightRules;

  var Mode = function () {
    this.HighlightRules = TTK91HighlightRules;
  };

  oop.inherits(Mode, TextMode);

  exports.Mode = Mode;
});

ace.define('ace/mode/ttk91_highlight_rules', (require, exports, module) => {
  var oop = require('ace/lib/oop');
  var TextHighlightRules = require('ace/mode/text_highlight_rules').TextHighlightRules;

  var TTK91HighlightRules = function () {
    console.log(123);
    this.$rules = {
      start: [

        {
          token: 'comment.line',
          regex: ';.*$',
        },
        {
          token: 'keyword',
          regex: 'EQU|DC|DS|NOP|STORE|LOAD|IN|OUT|ADD|SUB|MUL|DIV|MOD|AND|OR|XOR|SHL|SHR|ASHR|NOT|COMP|JN?(EQU|LES|GRE|ZER|POS|NEG)|JUMP|CALL|EXIT|PUSH|POP|PUSHR|POPR|SVC',
          next: 'operands',
        }
      ],
      operands: [
        {
          token: 'end',
          regex: '$',
          next:  'start',
        },
        {
          token: 'keyword.operator',
          regex: '[@=]',
        },
        {
          token: 'constant',
          regex: 'R[0-8]|SP',
        },
        {
          token: ['variable'],
          regex: '[a-zA-Z][a-zA-Z0-9]+',
        },
        {
          token: 'constant.numeric',
          regex: '0x[0-9A-Fa-f]+|[0-9]+',
        },
      ],
    };
  };

  oop.inherits(TTK91HighlightRules, TextHighlightRules);

  exports.TTK91HighlightRules = TTK91HighlightRules;
});

export default ace;
