<template>
  <div class="c-app">
    <div class="header">
    	<Logo highlight="#fa5252" color="#495057" />
      <div style="flex-grow: 1"></div>
      <Controls />
    </div>
    <multipane>
      <div :style="{ width: '35em' }">
        <Editor />
      </div>
      <multipane-resizer></multipane-resizer>
      <div :style="{ flexGrow: 1 }" class="right-pane">
        <ControlPanel />
      </div>
    </multipane>
  </div>
</template>

<script>
  import Editor from './components/Editor.vue';
  import ControlPanel from './components/ControlPanel.vue';
  import Controls from './components/Controls.vue';
  import { Multipane, MultipaneResizer } from 'vue-multipane';
  import InlineSvg from 'vue-inline-svg';
  import Logo from './components/Logo.vue';

  /**
   * Root component of the app.
   */
  export default {
    name: 'App',
    components: { Editor, Multipane, MultipaneResizer, ControlPanel, InlineSvg, Logo, Controls },
  };
</script>

<style>
  .c-app {
    width: 100%;
    height: 100%;
    color: #495057;
  }

  .header {
    z-index: 1;
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 5em;
    background-color: #f1f3f5;
    border-bottom: 1px solid #dee2e6;
    box-shadow: 0px -13px 20px 10px rgba(0,0,0,0.3);
    margin-top: -1px;
    padding-top: 1px;
    line-height: 3em; 
    padding: 0 1em;
    font-family: sans-serif;
    display: flex;
    align-items: center;
  }

  .header svg {
  	height: 2.5em;
  }

  .header h1 {
    margin: 0;
    padding: 0;
  }

  .control-panel {
  }

  .multipane {
  	height: 100%;
    width: 100%;
    position: relative;
    margin-top: -5em;
    padding-top: 5em;
    box-sizing: border-box;
  }

  .multipane-resizer {
    margin: 0; left: 0;
    position: relative;
  }

  .multipane-resizer:before {
    display: block;
    content: "";
    width: 3px;
    height: 40px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -20px;
    margin-left: -1.5px;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    background: white;
    border-radius: 3px;
  }

  .right-pane {
    overflow-y: scroll;
  }

  .multipane-resizer:hover:before {
    border-color: #999;
  }
</style>
