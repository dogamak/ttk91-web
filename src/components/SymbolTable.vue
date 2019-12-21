<template>
  <div class="symbol-table">
    <table>
      <tr>
        <th>Symbol</th>
        <th>Address</th>
        <th>Value</th>
      </tr>
      <tr v-for="symbol in symbols">
        <td>{{ symbol.name }}</td>
        <td>{{ symbol.address }}</td>
        <td>{{ symbol.value }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  /**
   * Table that displays all symbols, their addresses and values.
   */
  export default {
    name: 'SymbolTable',

    data () {
      return {
        watcher: this.$emulator.getWatcher(),
      };
    },

    watched: {
      computed (symbols) {
      },
    },

    computed: {
      /**
       * @typedef {Object} Symbol
       * @prop {string} name - The label of the symbol.
       * @prop {number} address - The memory address of the symbol.
       * @prop {number} value - The current value of the symbol.
       */

      /**
       * List of objects describing the symbols.
       * @type {Symbol[]}
       */
      symbols () {
        let res = Object.keys(this.$emulator.symbols)
          .map((label) => {
            let address = this.$emulator.symbols[label];
            this.watcher.watch(address);

            return {
              name: label,
              address,
              value: this.watcher.addresses[address],
            };
          });

        if (res.length === 0)
          return [{}];

        return res;
      },
    },

    /*watched: {
      symbols (oldValue, newValue) {
        let new = [];
        let old = [];

        for (let i = 0; i < newValue.length;) {
          for (let entry of oldValue) {
            if (entry === newValue[i]) {
              break;
            }
          }
        }
      },
    },*/
  };
</script>

<style lang="scss" scoped>
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
