<template>
  <div class="stack">
    <table>
      <tr>
        <th>Address</th>
        <th>Value</th>
      </tr>
      <tr v-if="$emulator.stack.length === 0">
        <td></td>
        <td></td>
      </tr>
      <tr v-for="(value, offset) in $emulator.stack">
        <td>{{ $emulator.stackBaseAddress - offset }}</td>
        <td>{{ value }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  export default {
    name: 'Stack',
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
