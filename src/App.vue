<template>
  <div class="c-app">
    <div class="header">
      <h1>TTK91 Playground</h1>
    </div>
    <multipane>
      <div :style="{ width: '35em' }">
        <Editor />
      </div>
      <multipane-resizer></multipane-resizer>
      <div :style="{ flexGrow: 1 }">
        <ControlPanel />
      </div>
    </multipane>
  </div>
</template>

<script>
  import Editor from './components/Editor.vue';
  import ControlPanel from './components/ControlPanel.vue';
  import { Multipane, MultipaneResizer } from 'vue-multipane';

  export default {
    name: 'App',
    components: { Editor, Multipane, MultipaneResizer, ControlPanel },
  };
</script>

<style>
  .c-app {
    width: 100%;
    height: 100%;
  }

  .header {
    width: 100%;
    height: 3em;
    background-color: #ccc;
    border-bottom: #aaa;
    color: #333;
    box-shadow: 0px -13px 20px 10px rgba(0,0,0,0.3);
    margin-top: -1px;
    padding-top: 1px;
    line-height: 3em; 
    padding: 0 1em;
    font-family: sans-serif;
  }

  .header h1 {
    margin: 0;
    padding: 0;
  }

  .multipane {
  	height: 100%;
    width: 100%;
    position: relative;
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
  .multipane-resizer:hover:before {
    border-color: #999;
  }
</style>
