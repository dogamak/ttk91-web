<template>
  <div class="output">
    <div v-for="(item, index) in output" :key="index">
      <Value :value="item" />
    </div>
  </div>
</template>

<script>
  import { leftPad } from '@/utils.js';
  import Value from './Value.vue';

  /**
   * Displays the values the emulator has printed.
   */
  export default {
    name: 'Output',

    components: { Value },

    methods: {
      leftPad,
    },

    computed: {
      /**
       * The numbers the emulator has printed during the current programs execution.
       */
      output () {
        return this.$emulator.output;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .output span {
    display: block;
  }

  .output {
    background-color: $oc-gray-9;
    border-radius: 3pt;
    border: 1px solid black;
    color: $oc-gray-1;
    padding: 0.5em 0;
    font-family: monospace;
    font-size: 1rem;
    max-width: 30em;
    min-height: 5em;
  }

  .output > div {
    padding: 0 0.5em;
  }

  .output > div:hover {
    background-color: $oc-gray-8;
  }

  .output > div > div {
    display: inline-block;
  }
</style>
