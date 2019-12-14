<template>
  <div class="controls">
    <Button label="Load" primary @click="onExecute" />
    <Button label="Run" @click="onRun" />
    <Button label="Step" @click="onStep" />
    <Button label="Stop" @click="onStop" />
  </div>
</template>

<script>
  import * as emulator from '../emulator.js';
  import Button from './Button.vue';

  export default {
    name: 'Controls',

    components: { Button },

    methods: {
      onExecute () {
        emulator.execute(this.$store.state.assembly);
      },

      onStep () {
        emulator.step();
      },

      onRun () {
        emulator.run();
      },

      onStop () {
        emulator.stop();
      },
    },
  }
</script>

<style>
  .c-button {
    margin-left: 0.5em;
  }
</style>
