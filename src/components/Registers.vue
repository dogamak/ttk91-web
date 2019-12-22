<template>
  <div class="registers">
    <table>
      <tr>
        <th></th>
        <th>Decimal</th>
        <th>Hex</th>
        <th>References</th>
      </tr>
      <tr v-for="register in registers">
        <th>{{register.name}}</th>
        <td><Value :value="register.value" format="decimal"/></td>
        <td><Value :value="register.value" format="hexadecimal"/></td>
        <td style="text-align: left">
          <Value
            v-show="watcher.addresses[register.value] !== undefined"
            format="hexadecimal"
            :value="watcher.addresses[register.value]" />
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
  import { leftPad } from '@/utils.js';
  import Value from './Value.vue';

  /**
   * Displays a table of all registers and their values in multiple formats.
   */
  export default {
    name: 'Registers',

    components: { Value },

    data () {
      return {
        watcher: this.$emulator.getWatcher(),
      };
    },

    watch: {
      '$emulator.registers' (registers, oldRegisters) {
        for (let value of oldRegisters) {
          this.watcher.unwatch(value);
        }

        for (let value of registers) {
          this.watcher.watch(value);
        }
      }
    },

    computed: {
      /**
       * @typedef {Object} Register
       * @prop {string} name - Human readable name of the register.
       * @prop {number} value - Value of the register.
       */

      /**
       * List of registers and their values.
       * @type {Register[]}
       */
      registers () {
        let registers = [];

        for (let i = 1; i < 8; i++) {
          registers.push({
            name: `R${i}`,
            value: this.$emulator.registers[i] || 0,
          });
        }

        return registers;
      }
    },

    methods: {
      leftPad,
    },
  };
</script>

<style scoped lang="scss">
  table {
    border: 1px solid $oc-gray-3;
    border-radius: 3px;
    border-spacing: 0;
    background-image: linear-gradient(to bottom right, $oc-gray-1 0%, $oc-gray-3 100%);

    tr {
      th, td {
        padding: 0 0.75em;
        text-align: right;
        font-variant: tabular-nums;
        height: 1.75em;
      }

      th {
        color: $oc-gray-8;
        font-weight: normal;
      }

      &:first-child th:not(:first-child) {
        border-bottom: 1px solid $oc-gray-2;
      }

      &:not(:first-child) th:first-child {
        border-right: 1px solid $oc-gray-2;
      }

      td {
        background-color: white;
      }
    }
  }
</style>
