<template>
  <div class="value">
    <span
      class="no-wrap"
      @mouseover="onMouseOver"
      @mouseout="onMouseOut">
      {{ formated(format) }}
    </span>
    <div
      :class="{ visible: popupVisible }"
      class="popup-spacer">
      <div
        class="popup"
        ref="popup"
        :style="{ transform: 'translateX('+offsetX+'px)' }">
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
          <tr v-show="typeof watcher.addresses[computedValue] === 'number'" v-if="depth > 0">
            <th>References</th>
            <td>
              <Value
                :value="watcher.addresses[computedValue]"
                :depth="depth-1"/>
            </td>
          </tr>
        </table>
        <a href="#">Jump To »</a>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Value',

    data () {
      return {
        watcher: this.$emulator.getWatcher(),
        hoverTimeout: null,
        popupVisible: false,
        offsetX: 0,
      };
    },

    props: {
      depth: {
        type: Number,
        default: 0,
      },
      value: Number,
      address: Number,
      format: {
        type: String,
        default: 'decimal',
        validator: value => ['decimal', 'binary', 'hexadecimal'].indexOf(value) !== -1,
      },
    },

    beforeDestroy () {
      this.watcher.destroy();
    },

    watch: {
      value: {
        immediate: true,
        async handler (newValue, oldValue) {
          console.log(`value ${oldValue} -> ${newValue}`);
          this.watcher.unwatch(oldValue);
          await this.watcher.watch(newValue);
        },
      },
      address: {
        immediate: true,
        async handler (newAddress, oldAddress) {
          if (newAddress === oldAddress)
            return;

          if (oldAddress !== null) {
            this.watcher.unwatch(oldAddress);
          }

          await this.watcher.watch(newAddress);
        },
      },
      'watcher.addresses': {
        immediate: true,
        async handler (newAddresses, oldAddresses) {
          if (typeof this.value !== 'number')
            return;

          if (typeof this.address !== 'number')
            return;

          if (oldAddresses !== undefined)
            await this.watcher.unwatch(oldAddresses[this.address]);

          await this.watcher.watch(newAddresses[this.address]);
        },
      },
    },

    computed: {
      computedValue () {
        if (typeof this.value === 'number')
          return this.value;

        return this.watcher.addresses[this.address];
      },
    },

    methods: {
      formated(format) {
        if (typeof this.computedValue !== 'number') {
          return 'Undef.';
        }

        const sign = (Math.sign(this.computedValue) === -1) ? '-' : '';

        const value = Math.abs(this.computedValue);

        function insertSpaces (str, interval) {
          let result = '';

          let i = str.length;
          while (i > 0) {
            const next = Math.max(0, i - interval);
            result = str.slice(next, i) + ' ' + result;
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
      },

      onMouseOver () {
        this.hoverTimeout = setTimeout(this.showPopup.bind(this), 200);
      },

      onMouseOut () {
        clearTimeout(this.hoverTimeout);
      },

      showPopup () {
        this.popupVisible = true;

        const popupRect = this.$refs.popup.getBoundingClientRect();
        const panelRect = document.getElementsByClassName('control-panel')[0]
          .getBoundingClientRect();

        if (popupRect.x - 10 < panelRect.x) {
          this.offsetX = panelRect.x - popupRect.x + 10;
        }

        if (popupRect.x + popupRect.width + 10 > panelRect.x + panelRect.width) {
          this.offsetX = panelRect.x + panelRect.width
            - popupRect.x - popupRect.width - 10;
        }

        document.addEventListener('mousemove', (evt) => {
          if (!this.$el.contains(evt.target)) {
            this.popupVisible = false;
            clearTimeout(this.hoverTimeout);
          }
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .value {
    position: relative;
    display: inline-block;

    span {
      font-family: monospace;
      font-size: 1rem;
    }

    .popup-spacer {
      position: absolute;
      pointer-events: none;
      opacity: 0;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding-top: 5px;
      z-index: 100;

      &.visible {
        pointer-events: initial;
        opacity: 1;
      }

      &::before {
        content: '';
        width: 0;
        height: 0;
        border-width: 10px;
        border-style: solid;
        border-color: transparent;
        border-bottom-color: $oc-gray-4;
        position: absolute;
        top: -13px;
        left: 50%;
        margin-left: -10px;
      }

      &::after {
        content: '';
        width: 0;
        height: 0;
        border-width: 8px;
        border-style: solid;
        border-color: transparent;
        border-bottom-color: white;
        position: absolute;
        top: -9px;
        left: 50%;
        margin-left: -8px;
      }

      .popup {
        color: $oc-gray-8;
        text-align: left;
        position: relative;
        padding: 0.5em;
        box-shadow: 0px 3px 10px -5px rgba(0,0,0,0.2);

        /* background-image: linear-gradient(to bottom right, $oc-gray-2 0%, $oc-gray-3 100%); */
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

        a {
          font-size: 0.8em;
        }
      }
    }
  }

  .no-wrap {
    white-space: nowrap;
  }

  a {
    color: $oc-blue-6;
  }
</style>
