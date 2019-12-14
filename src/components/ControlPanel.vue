<template>
  <div class="control-panel">
    <div class="registers-container">
      <h3>Registers:</h3>
      <Registers />
    </div>
    <div class="state-container">
      <h3>Flags:</h3>
      Current line: {{ executionLine }}
    </div>
    <h3>Output:</h3>
    <Output />
  </div>
</template>

<script>
  import * as emulator from '../emulator.js';
  import Registers from './Registers.vue';
  import Output from './Output.vue';

  export default {
    name: 'ControlPanel',
    components: { Registers, Output },
    methods: {
      leftPad (str, pad, len) {
        while (str.length < len) {
          str = pad + str;
        }
        return str;
      }
    },
    computed: {
      executionLine () {
        return this.$store.state.executionLine;
      }
    },
  };
</script>

<style scoped lang="scss">
  .control-panel {
    padding: 2em;
    font-family: sans-serif;
  }

  h3 {
    margin-left: -0.75em;
  }
</style>
