<template>
  <div class="value-popup">
    <table>
      <tr>
        <th>Decimal</th>
        <td class="no-wrap">{{ formated('decimal') }}</td>
      </tr>
      <tr>
        <th>Hexadecimal</th>
        <td>{{ formated('hexadecimal') }}</td>
      </tr>
      <tr>
        <th>Binary</th>
        <td>{{ formated('binary') }}</td>
      </tr>
      <tr v-if="watcher.addresses[value] === 'undefined'">
        <th>References</th>
        <td>
          <Value :value="watcher.addresses[value]" />
        </td>
      </tr>
    </table>
    <a
      v-if="$emulator.sourceMap[value]"
      href="#"
      @click="jumpToDefinition">
      Jump To »
    </a>
  </div>
</template>

<script>
import EventBus from '../bus.js'; 

export default {
  name: 'ValuePopup',

  components: {
    Value: () => import('./Value.vue'),
  },

  props: {
    value: Number,
  },

  data() {
    return {
      watcher: this.$emulator.getWatcher(),
    };
  },

  watch: {
    value: {
      immediate: true,
      async handler(newValue, oldValue) {
        if (oldValue !== undefined) {
          this.watcher.unwatch(oldValue);
        }

        await this.watcher.watch(newValue);
      },
    },
  },

  methods: {
    /**
     * Returns the value ({@link Value.computedValue}) in the specified
     * numbering system.
     */
    formated(format) {
      if (typeof this.value !== 'number') {
        return 'Undef.';
      }

      const sign = (Math.sign(this.value) === -1) ? '-' : '';

      const value = Math.abs(this.value);

      function insertSpaces (str, interval) {
        let result = '';

        let i = str.length;
        while (i > 0) {
          const next = Math.max(0, i - interval);
          result = `${str.slice(next, i)} ${result}`;
          i = next;
        }

        return result;
      }

      if (format === 'decimal') {
        return insertSpaces(value.toString(), 3);
      }

      if (format === 'hexadecimal') {
        const num = value.toString(16).toUpperCase();
        const pad = '0'.repeat(8 - num.length);
        return `${sign}${insertSpaces(pad + num, 4)}`;
      }

      if (format === 'binary') {
        const num = value.toString(2).toUpperCase();
        const pad = '0'.repeat(32 - num.length);
        return `${sign}${insertSpaces(pad + num, 8)}`;
      }

      return 'Invalid format';
    },

    jumpToDefinition() {
      EventBus.$emit(
        'editor-set-line',
        this.$emulator.sourceMap[this.value],
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.value-popup {
  color: $oc-gray-8;
  text-align: left;
  position: relative;
  padding: 0.5em;
  box-shadow: 0px 3px 10px -5px rgba(0,0,0,0.2);
  background-color: white;
  border-radius: 3px;
  border: 1px solid $oc-gray-4;

  th {
    text-align: left;
  }

  td {
    text-align: right;
    font-family: monospace;
    font-size: 1rem;
  }

  a, a:active, a:visited {
    font-size: 0.8em;
    color: $oc-blue-6;
  }
}
</style>
