<template>
  <div class="controls">
    <Button label="Load" :disabled="disableLoad" primary @click="onExecute"/>
    <Button label="Run" @click="onRun" />
    <Button label="Step" @click="onStep" />
    <Button label="Stop" @click="onStop" />
  </div>
</template>

<script>
  import Button from './Button.vue';

  export default {
    name: 'Controls',

    components: { Button },

    methods: {
      onExecute () {
        this.$emulator.execute(this.$store.state.assembly);
      },

      onStep () {
        this.$emulator.step();
      },

      onRun () {
        this.$emulator.run();
      },

      onStop () {
        this.$emulator.stop();
      },
    },

    computed: {
      disableLoad () {
        return this.$store.state.parseState !== 'success';
      },
    },
  }
</script>

<style>
  .c-button {
    margin-left: 0.5em;
  }
</style>
