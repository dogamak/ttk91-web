<template>
  <div class="output">
    <div v-for="item in output">
      <div class="decimal">
        {{item}}
      </div>
      <div class="hexadecimal">
        0x{{leftPad(item.toString(16), '0', 4)}}
      </div>
      <div class="binary">
        0b{{leftPad(item.toString(2), '0', 16)}}
      </div>
    </div>
  </div>
</template>

<script>
  import { leftPad } from '@/utils.js';

  /**
   * Displays the values the emulator has printed.
   */
  export default {
    name: 'Output',

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

  .output > div:not(:hover) > div:not(.decimal) {
    display: none;
  }

  .output .decimal {
    width: 5em;
  }
  
  .output .hexadecimal {
    margin-right: 2em;
    color: $oc-gray-5;
  }

  .output .binary {
    color: $oc-gray-5;
  }
</style>
