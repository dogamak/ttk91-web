<template>
  <div class="c-button">
    <input type="button" :value="label" @click="onClick" :class="classes" />
  </div>
</template>

<script>
  /**
   * A styled button.
   */
  export default {
    name: 'Button',

    props: {
      /**
       * The label displayed on the button.
       * @type {number}
       */
      label: {
        type: String,
        required: true,
      },

      /**
       * If present this button is considered a primary button.
       * This can affect both styling and functionality.
       */
      primary: Boolean,

      /**
       * If present this button is considered a secondary button.
       * This can affect both styling and functionality.
       */
      secondary: Boolean,

      /**
       * If this property is present, the button cannot be activated
       * and appears as faded out.
       */
      disabled: Boolean,

      /**
       * The color of this button.
       * Overrides styling set for primary or secondary buttons.
       */
      color: String,
    },

    computed: {
      /**
       * Generates the list of CSS classes for the button based on the properties
       */
      classes () {
        let classes = [];

        if (this.color !== undefined) {
          classes.push(this.color);
        } else if (this.primary) {
          classes.push('primary');
        } else if (this.secondary) {
          classes.push('secondary')
        }

        if (this.disabled) {
          classes.push('disabled');
        }

        return classes;
      },
    },

    methods: {
      /**
       * Callback that is called whenever the user clicks the button.
       * Propagates the even upward the Component chain.
       */
      onClick (evt) {
        if (!this.disabled) {
          this.$emit('click', evt);
        }
      }
    },
  };
</script>

<style lang="scss" scoped>
  $disabled-lightness-factor: 33%;

  @mixin variant ($bg-from, $bg-to, $border, $text) {
    background-image: linear-gradient(180deg, $bg-from 0%, $bg-to 100%);
    border-color: $border;
    color: $text;
    
    &.disabled {
      background-image: linear-gradient(
        180deg,
        scale-color($bg-from, $lightness: $disabled-lightness-factor) 0%,
        scale-color($bg-to, $lightness: $disabled-lightness-factor) 100%);
      border-color: scale-color($border, $lightness: $disabled-lightness-factor);
      color: scale-color($text, $lightness: $disabled-lightness-factor);
    }
  }

  .c-button {
    display: inline-block;

    input[type="button"] {
      border-width: 1px;
      border-style: solid;
      border-radius: 3px;
      padding: 0.5em 1em;
      transition-duration: 100ms;
      transition-property: box-shadow;
      font-weight: bold;

      @include variant($oc-gray-1, $oc-gray-2, $oc-gray-5, $oc-gray-7);

      &:not(.disabled) {
        cursor: pointer;

        &:hover:not(:active) {
          box-shadow: 0px 2px 3px -1px rgba(0,0,0,0.2);
        }

        &:active {
          padding: calc(0.5em - 1px) calc(1em - 1px);
          margin: 1px 1px;
        }
      }

      &.primary, &.red {
        @include variant($oc-red-5, $oc-red-6, $oc-red-8, white);
      }

      &.disabled {
        border-color: $oc-gray-3;
        background-image: linear-gradient(180deg, $oc-gray-0 0%, $oc-gray-1 100%);
      }
    }
  }
</style>
