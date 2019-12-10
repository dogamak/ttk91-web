import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    assembly: '',
    registers: [],
    output: [],
    executionLine: 0,
  },

  mutations: {
    setAssembly (state, { assembly }) {
      state.assembly = assembly;
    },

    setRegisters (state, { registers }) {
      state.registers = registers;
    },

    setOutput (state, { output }) {
      state.output = output;
    },

    setExecutionLine (state, { line }) {
      state.executionLine = line;
    }
  },
});
