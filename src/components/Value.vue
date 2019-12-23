<template>
  <div class="value">
    <span
      class="no-wrap"
      :class="{ active: popupVisible }"
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
          <tr
            v-show="typeof watcher.addresses[computedValue] === 'number'"
            v-if="depth > 0">
            <th>References</th>
            <td>
              <Value
                :value="watcher.addresses[computedValue]"
                :depth="depth-1" />
            </td>
          </tr>
        </table>
        <a href="#">Jump To »</a>
      </div>
    </div>
  </div>
</template>

<script>
  /**
   * Component for displaying a numerical value or an address.
   * Shows an informational tooltip when hovered which contains
   * the value in decimal, binary and hex as well as the value
   * of the memory location the value points to.
   */
  export default {
    name: 'Value',

    data () {
      return {
        /**
         * @name watcher
         * @type {MemoryWatcher}
         */
        watcher: this.$emulator.getWatcher(),

        /**
         * Identifier of a currently active timer which will trigger the popup with
         * {@link Value#showPopup}. If the mouse moves off of the component,
         * {@link Value#onMouseOut} clears the timeout and sets this to null.
         *
         * @name Value.hoverTimeout
         * @type {number?}
         * @default null
         */
        hoverTimeout: null,

        /**
         * Whether or not the popup is currently visible.
         *
         * @name popupVisible
         * @type {boolean}
         * @default false
         */
        popupVisible: false,

        /**
         * Offset of the popup on the x-axis in pixels.
         * Used to shift the popup so that it is fully visible when near the edges
         * of the visible area.
         * Re-calculated whenever {@link Value#showPopup} is called.
         *
         * @name offsetX
         * @type {number!}
         * @default 0
         */
        offsetX: 0,
      };
    },

    props: {
      /**
       * If a pointer has multiple levels of indirection, we can show popups for the
       * values inside other popups. This property sets the maximum depth of nested
       * popups. Defaults to 1 for performance reasons.
       */
      depth: {
        type: Number,
        default: 1,
      },

      /**
       * This property can be used to set the displayed value explicitly.
       */
      value: Number,

      /**
       * Alternative to {@link Value.value} that displays the value of the given
       * memory location. If the parent component already watches the value of the
       * address, it is advisable to use {@link Value.value} instead.
       */
      address: Number,

      /**
       * Specifies the format (numeral system) in which the in-line value is displayed.
       * Supports the following values: decimal, binary and hexadecimal.
       */
      format: {
        type: String,
        default: 'decimal',
        validator: (value) => ['decimal', 'binary', 'hexadecimal'].indexOf(value) !== -1,
      },
    },

    beforeDestroy () {
      this.watcher.destroy();
    },

    watch: {
      /**
       * Updates the watched address whenever the {@link Value#value} prop updates.
       */
      value: {
        immediate: true,
        async handler (newValue, oldValue) {
          this.watcher.unwatch(oldValue);
          await this.watcher.watch(newValue);
        },
      },

      /**
       * Updates the watched addresses whenever the {@link Value#address} prop updates.
       */
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

      /**
       * Updates the watcher for the referenced value whenever the pointer changes.
       */
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
      /**
       * The displayed value.
       * If the value is defined by an address, resolves to the value at the location
       * specified by the {@link Value.address} proprty. Otherwise resolves to the
       * value of specified with {@link Value.value}.
       */
      computedValue() {
        if (typeof this.value === 'number') {
          return this.value;
        }

        return this.watcher.addresses[this.address];
      },
    },

    methods: {
      /**
       * Returns the value ({@link Value.computedValue}) in the specified
       * numbering system.
       */
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

      /**
       * Starts the timer for displaying the popoup whenever the cursor
       * enters the component.
       *
       * @listens MouseOverEvent
       */
      onMouseOver() {
        this.hoverTimeout = setTimeout(this.showPopup.bind(this), 200);
      },

      /**
       * Clears the timer for displaying the popup whenever the cursor
       * leaves the component. Hiding the popup is handled by a global event
       * listener registered in {@link Value#showPopup}.
       *
       * @listens MouseOutEvent
       */
      onMouseOut() {
        clearTimeout(this.hoverTimeout);
      },

      /**
       * Calculates the {@link Value.offsetX} value for the popup based on it's
       * location relative to the panel's visible area and makes the popup visible.
       *
       * Registers a global callback for `mousemove` event which hides the popup
       * when the mouse moves outside of the popup.
       */
      showPopup() {
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
      padding: 0 0.2em;
      cursor: help;

      &:hover, &.active {
        border-radius: 3px;
        background: $oc-red-4;
        color: white;
      }
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
