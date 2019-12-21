<template>
  <div class="value">
    <span
      @mouseover="onMouseOver"
      @mouseout="onMouseOut">
      {{ formated(format) }}
    </span>
    <div class="popup" :class="{ visible: popupVisible }">
      <table>
        <tr>
          <th>Decimal</th>
          <td>{{ formated('decimal') }}</td>
        </tr>
        <tr>
          <th>Hexadecimal</th>
          <td>{{ formated('hexadecimal') }}</td>
        </tr>
        <tr>
          <th>Binary</th>
          <td>{{ formated('binary') }}</td>
        </tr>
        <!--<tr v-if="$emulator.memory[value] !== undefined">
          <th>References</th>
          <td>{{$emulator.memory[value]}}</td>
        </tr>-->
      </table>
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
      };
    },

    props: {
      value: Number,
      format: {
        type: String,
        default: 'decimal',
        validator: value => ['decimal', 'binary', 'hexadecimal'].indexOf(value) !== -1,
      },
    },

    watch: {
      value (newValue) {
        this.watcher = this.$emulator.getWatcher();
        this.watcher.watch(newValue);
      }
    },

    methods: {
      formated (format) {
        if (format === 'decimal') {
          return `${this.value}`;
        } else if (format === 'hexadecimal') {
          return this.value.toString(16).toUpperCase();
        } else if (format === 'binary') {
          return this.value.toString(2);
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

    .popup {
      z-index: 100;
      display: none;
      position: absolute;
      top: 100%;
      margin-top: 5px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0.5em;
      box-shadow: 0px 3px 10px -5px rgba(0,0,0,0.2);

      &.visible {
        display: block;
      }

      /* background-image: linear-gradient(to bottom right, $oc-gray-2 0%, $oc-gray-3 100%); */
      background-color: white;
      border-radius: 3px;
      border: 1px solid $oc-gray-4;

      &::before {
        content: '';
        width: 0;
        height: 0;
        border-width: 10px;
        border-style: solid;
        border-color: transparent;
        border-bottom-color: $oc-gray-4;
        position: absolute;
        top: -18px;
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
        top: -14px;
        left: 50%;
        margin-left: -9px;
      }

      th {
        text-align: left;
      }
    }
  }
</style>
