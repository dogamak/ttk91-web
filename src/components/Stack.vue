<template>
  <div class="stack">
    <table>
      <tr>
        <th>Address</th>
        <th>Value</th>
        <th></th>
      </tr>
      <tr v-if="$emulator.stackBaseAddress == $emulator.stackPointer">
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr v-for="entry in stack">
        <td>{{ entry.address }}</td>
        <td>{{ entry.value }}</td>
        <td>Pushed at line {{ entry.pushedAt }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  export default {
    name: 'Stack',

    computed: {
      stack () {
        let result = [];

        console.log(`$emulator.stack.length: ${this.$emulator.stack.length}`);
        for (let i = 0; i < this.$emulator.stack.length; i++) {
          let address = this.$emulator.stackBaseAddress - i;

          result.push({
            address,
            value: this.$emulator.stack[i],
            pushedAt: this.$emulator.stackMetadata[address].pushedOnLine,
          });
        }

        return result;
      },
    },
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
        text-align: left;
      }
    }
  }
</style>
