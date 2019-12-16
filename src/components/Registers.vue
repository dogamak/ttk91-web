<template>
  <div class="registers">
    <table>
      <tr>
        <th></th>
        <th>Decimal</th>
        <th>Hexadecimal</th>
        <th>Binary</th>
      </tr>
      <tr v-for="register in registers">
        <th>{{register.name}}</th>
        <td>{{register.value}}</td>
        <td>{{leftPad(register.value.toString(16), '0', 4)}}</td>
        <td>{{leftPad(register.value.toString(2), '0', 16)}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  import { leftPad } from '@/utils.js';

  /**
   * Displays a table of all registers and their values in multiple formats.
   */
  export default {
    name: 'Registers',

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
            value: this.$store.state.registers[i] || 0,
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
