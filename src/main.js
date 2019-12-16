import "core-js/stable";
import "regenerator-runtime/runtime";

import Vue from 'vue';
import Vuex from 'vuex';
import AsyncComputed from 'vue-async-computed';

Vue.use(AsyncComputed);

import './emulator.js';
import store from './store.js';
import App from './App.vue';

new Vue({
  store,
  el: '#app',
  render: h => h(App),
});
