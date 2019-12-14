<template>
  <div class="editor" style="font-size: 1rem" ref="editor"></div>
</template>

<script>
  import ace from 'ace-builds';
  import * as ttk91 from '@dogamak/ttk91-wasm';

  ace.config.set('basePath', '/ttk91web');

  export default {
    name: 'Editor',

    data () {
      return {
		    editor: null,
        editTimer: null,
        executionLineMarkerID: null,
	    };
    },

    mounted () {
      let editor = this.editor = ace.edit(this.$refs.editor);
      window.editor = editor;

      editor.getSession().setMode({
        path: 'ace/mode/ttk91',
      });

      editor.on('change', (param) => {
        clearTimeout(this.editTimer);
        this.editTimer = setTimeout(this.parse.bind(this), 1000);

        this.$store.commit('setAssembly', {
          assembly: this.editor.getValue(),
        })
      });
    },

    methods: {
      parse() {
        console.log(this.editor.getValue());

        try {
          let result = ttk91.parse(this.editor.getValue());
          this.editor.getSession().setAnnotations([]);
        } catch (e) {
          console.log(e);
          this.editor.getSession()
            .setAnnotations([{
              row: e.line-1,
              column: e.column,
              text: e.error,
              type: "error",
            }]);
        }
      }
    },

    computed: {
      executionLine () {
        return this.$store.state.executionLine;
      }
    },

    watch: {
      executionLine (newValue, oldValue) {
        let session = this.editor.getSession();

        console.log(this.executionLineMarkerID);
        console.log(newValue);
        session.removeMarker(this.executionLineMarkerID);

        this.executionLineMarkerID =
          session.addMarker(new ace.Range(newValue-1, 0, newValue-1, 1), 'execution-line', 'fullLine');
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
  }

  .execution-line {
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
</style>
