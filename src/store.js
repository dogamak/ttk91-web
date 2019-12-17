import Vue from 'vue';
import Vuex from 'vuex';

import emulator from './emulator.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    assembly: '',
  },

  mutations: {
    setAssembly (state, { assembly }) {
      state.assembly = assembly;
    },
  },
});
