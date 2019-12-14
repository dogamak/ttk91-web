<template>
  <inline-svg src="../assets/ttk91web-light.svg" :highlight="highlight" />
</template>

<script>
  import InlineSvg from 'vue-inline-svg';

  export default {
    components: { InlineSvg },
    name: 'Logo',
    props: {
      highlight: String,
    },
  };
</script>
