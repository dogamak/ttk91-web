import Vue from 'vue';
import Vuex from 'vuex';

import emulator from './emulator.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    assembly: '',
    registers: [],
    output: [],
    executionLine: 0,
    stackBaseAddress: null,
    stackPointer: null,
    stack: [],
  },

  mutations: {
    setStack (state, { pointer, stack }) {
      state.stack = stack;
      state.stackPointer = pointer;
    },

    popStack (state, { amount }) {
      state.stack.splice(state.stack.length - amount, amount);
    },

    setAssembly (state, { assembly }) {
      state.assembly = assembly;
    },

    resetEmulator (state, { registers }) {
      for (let i = 0; i < registers.length; i++) {
        Vue.set(state.registers, i, registers[i]);
      }

      state.stack = [];
      state.stackPointer = registers[7];
    },

    setRegister (state, { register, data }) {
      Vue.set(state.registers, register, data);
    },

    setOutput (state, { output }) {
      state.output = output;
    },

    setExecutionLine (state, { line }) {
      state.executionLine = line;
    },

    setStackBaseAddress (state, { address }) {
      state.stackBaseAddress = address;
    },
    
    setStackPointer (state, { address }) {
      state.stackPointer = address;
    },
  },

  actions: {
    async updateStack ({ commit, state }, { address }) {
      console.log(`New stack pointer: ${address} Old: ${state.stackPointer}`);
      if (state.stackPointer === null) {
        commit('setStackPointer', { address });
        return;
      }

      if (state.stackPointer > address) {
        // PUSH
        
        let pushed = [];

        for (let i = state.stackPointer; i > address; i--) {
          let response = await emulator.readAddress(state.stackPointer);
          pushed.push(response.payload.value);
        }

        commit('setStack', {
          pointer: address,
          stack: state.stack.concat(pushed),
        });
      } else if (state.stackPointer < address) {
        // POP

        commit('popStack', {
          amount: address - state.stackPointer,
        });
      }
    },
  },
});
