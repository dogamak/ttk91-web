<template>
  <inline-svg src="../assets/ttk91web-light.svg" :highlight="highlight" />
</template>

<script>
  import InlineSvg from 'vue-inline-svg';

  /**
   * Displays a ttk91web logo with the specified colors. Uses inline svg and css.
   */
  export default {
    components: { InlineSvg },
    name: 'Logo',
    props: {
      /**
       * Color of the [91] part of the logo
       */
      highlight: String,

      /**
       * Color of the base text in the logo
       */
      text: String,
    },
  };
</script>
