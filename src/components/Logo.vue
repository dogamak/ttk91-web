<template>
  <inline-svg src="../assets/ttk91web.svg" :style="{'--highlight-color': highlight, '--color': color}" />
</template>

<script>
  import InlineSvg from 'vue-inline-svg';

  export default {
    components: { InlineSvg },
    props: {
      highlight: String,
      color: String,
    },
  };
</script>

<style>
  svg {
    --highlight: attr(highlight);
  }

  svg .highlight path {
    fill: var(--highlight-color);
  }

  svg .highlight rect {
    stroke: var(--highlight-color);
  }

  svg .text {
    fill: var(--color);
  }
</style>
