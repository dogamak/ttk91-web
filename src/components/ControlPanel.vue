<template>
  <div class="control-panel">
    <h3>Registers:</h3>
    <Registers />

    <h3>Symbols:</h3>
    <SymbolTable />

    <h3>Stack:</h3>
    <Stack />

    <h3>Output:</h3>
    <Output />
  </div>
</template>

<script>
  import emulator from '../emulator.js';
  import Registers from './Registers.vue';
  import Output from './Output.vue';
  import SymbolTable from './SymbolTable.vue';
  import Stack from './Stack.vue';

  export default {
    name: 'ControlPanel',
    components: { Registers, Output, SymbolTable, Stack },
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
      },

      stackPointer () {
        return this.$store.state.stackPointer;
      },

      registers () {
        return this.$store.state.registers;
      },
    },

    asyncComputed: {
      async stackValue () {
        if (this.$store.state.stackBaseAddress !== this.$store.state.stackPointer) {
          let response = await emulator.readAddress(this.$store.state.stackPointer + 1);
          return response.payload.value;
        } else {
          return 0;
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .control-panel {
    padding: 2em;
    font-family: sans-serif;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    box-sizing: border-box;
  }

  h3 {
    margin-left: -0.75em;
  }
</style>
