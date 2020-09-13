<template>
  <div class="editor" style="font-size: 1rem" ref="editor"></div>
</template>

<script>
  // import ace from 'ace-builds';
  import * as monaco from 'monaco-editor';
  import * as ttk91 from 'ttk91-wasm';
  import EventBus from '../bus.js';

  monaco.languages.register({ id: 'ttk91' });

  class TTK91CodeActionProvider {
    constructor () {
      this.errors = {};
    }

    setErrors (model, errors) {
      this.errors[model.uri] = errors;

      const markers = errors.map((error) => {
        const marker = {
          startLineNumber: error.start_line,
          startColumn: error.start_column + 1,
          endLineNumber: error.end_line,
          endColumn: error.end_column + 1,
          severity: error.level === "Suggestion" ? 1 : 8,
          message: error.message,
        };

        error.marker = marker;

        return marker;
      });

      monaco.editor.setModelMarkers(model, 'parser', markers);
    }

    provideCodeActions(model, range, context, token) {
      const errors = this.errors[model.uri];

      if (!errors)
        return { actions: [], dispose () {} };

      const errorsInRange = errors.filter((error) => {
        return error.start_line <= range.startLineNumber
          && error.start_column <= range.startColumn
          && error.end_column >= range.endColumn
          && error.end_line >= range.endLineNumber;
      });

      const suggestions = errorsInRange.filter((error) => error.level === "Suggestion");

      const actions = suggestions.map((suggestion) => ({
        title: suggestion.message,
        kind: "quickfix",
        edit: {
          edits: [
            {
              resource: model.uri,
              edit: {
                range: suggestion.marker,
                text: suggestion.message.split(' ').pop(),
              },
            }
          ],
        },
        diagnostics: [
          suggestion.marker,
        ],
      }));

      console.log(errors, range, actions);

      return {
        actions,
        dispose () {}
      };
    }
  }

  const codeActionProvider = new TTK91CodeActionProvider();

  monaco.languages.registerCodeActionProvider('ttk91', codeActionProvider);

  monaco.languages.setMonarchTokensProvider('ttk91', {
    ignoreCase: true,
    unaryInstructions: /push|pop|jump|not/,
    binaryInstructions: /equ|dc|ds|nop|store|load|in|out|add|sub|mul|mov|div|mod|and|or|xor|shl|shr|ashr|comp|jn?(?:equ|les|gre|zer|pos|neg)|call|exit|pushr|popr|svc/,
    instructions: /@unaryInstructions|@binaryInstructions/,
    label: /[a-z][a-z0-9_]*/,

    tokenizer: {
      root: [
        ['@instructions', 'keyword', '@operand'],
        ['@label', 'type'],
        { include: '@whitespace' },
      ],

      whitespace: [
        [/;[^\n\r]*$/, 'comment'],
      ],

      operand: [
        [/(R[0-8])(\()/, ['constant', { token: 'bracket', next: '@indexRegister' }]],
        [/R[0-8]/, 'constant', '@interOperand'],
        [/[a-z][a-z0-9_]*/, 'type', '@interOperand'],
        [/(0x)?[0-9]+/, 'number', '@interOperand'],
        [/[@=]/, 'operator'],
        { include: '@whitespace' },
      ],

      interOperand: [
        [/,/, '', '@operand'],
        { include: '@root' },
      ],

      indexRegister: [
        { include: '@whitespace' },
        [/R[0-8]/, 'constant'],
        [/\)/, 'bracket', '@interOperand'],
        [/[^)]+/, 'error'],
      ],
    },
  });

  // ace.config.set('basePath', '/ttk91web');

  /**
   * Wrapper component for the Ace editor.
   */
  export default {
    name: 'Editor',

    data () {
      return {
        editor: null,
        decorations: [],
        editTimer: null,
        executionLineMarkerID: null,
      };
    },

    created() {
      EventBus.$on('editor-set-line', (line) => {
        this.editor.setPosition({
          column: 0,
          lineNumber: line,
        });
      });
    },

    mounted () {
      this.editor = monaco.editor.create(this.$refs.editor, {
        value: 'MOV R1, R2 ;; Comment',
        language: 'ttk91',
        automaticLayout: true,
      });
      window.editor = this.editor;

      /*editor.getSession().setMode({
        path: 'ace/mode/ttk91',
      }); */

      this.editor.getModel().onDidChangeContent((event) => {
        clearTimeout(this.editTimer);
        this.editTimer = setTimeout(this.parse.bind(this), 1000);

        this.$store.commit('setAssembly', {
          assembly: this.editor.getModel().getValue(),
        });

        this.$store.commit('setParseState', { state: 'failing' });
      });
    },

    methods: {
      parse() {
        try {
          let result = ttk91.parse(this.editor.getModel().getValue());
          // this.editor.getSession().setAnnotations([]);
          this.$store.commit('setParseState', { state: 'success' });

          codeActionProvider.setErrors(this.editor.getModel(), []);
        } catch (errors) {
          this.$store.commit('setParseState', { state: 'failure' });
          console.log(errors);
          codeActionProvider.setErrors(this.editor.getModel(), errors);
        }
      }
    },

    computed: {
      executionLine () {
        return this.$emulator.executionLine;
      }
    },

    watch: {
      executionLine (newValue, oldValue) {
        const model = this.editor.getModel();

        console.log(`Execution Line: ${newValue}`);

        this.decorations = model.deltaDecorations(
          this.decorations, [
            {
              range: new monaco.Range(newValue, 0, newValue, 1),
              options: {
                isWholeLine: true,
                className: 'executionLineDecoration',
              },
            }
          ],
        );

        return 0;
      }
    },
  };
</script>

<style>
  .editor {
    width: 100%;
    height: 100%;
    border-right: 1px solid #d5d5d5;
    color: #495057;
    z-index: -1;
  }

  .executionLineDecoration {
    background-color: rgba(255,0,0,0.3);
    position: absolute;
  }

  .editor .ace_keyword {
    color: #4263eb;
  }

  .editor .ace_constant {
    color: #d6336c !important;
  }

  .editor .ace_variable {
    color: #37b24d;
  }

  .Error {
    color: red;
  }

  .Suggestion {
    color: orange;
  }
</style>
