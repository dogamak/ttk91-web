import Vue from 'vue';
import Vuex from 'vuex';
import store from './store.js';
export let worker = new Worker('/ttk91web/worker.js');

// This monstrosity is used to generate the `eventHandler` and `messageHandler` decorators.
// The first arguments is the name of the property where a list of the listeners should be maintained.
// The second argument is the name of the generated dispatch method, which is used to send messages
// to the listeners.
function callbackRegisteringDecoratorFactory (listPropertyName, dispatchMethodName) {
  return (messageType) => {
    return (target, name, descriptor) => {
      if (target[dispatchMethodName] === undefined) {
        target[dispatchMethodName] = async function (eventName, payload) {
          let listeners = this[listPropertyName][eventName];

          if (listeners !== undefined) {
            for (let listener of listeners) {
              await Promise.resolve(listener.call(this, payload));
            }
          }
        }
      }

      if (target[listPropertyName] === undefined)
        target[listPropertyName] = {};

      if (target[listPropertyName][messageType] === undefined)
        target[listPropertyName][messageType] = [];

      let listeners = target[listPropertyName][messageType];

      listeners.push(descriptor.value);
    };
  }
}

function property (target, name, descriptor) {
  let value = descriptor.value;

  delete descriptor.initializer;
  delete descriptor.value;
  delete descriptor.writable;

  descriptor.get = value.bind(target);
  return descriptor;
}

// Message handlers are called when messages are received from the Worker.
const messageHandler = callbackRegisteringDecoratorFactory('messageHandlers', 'dispatchMessage');

// Event handlers are called when events are received from the emulator.
const eventHandler = callbackRegisteringDecoratorFactory('eventHandler', 'dispatchEvent');

class Emulator {
  constructor () {
    this.worker = new Worker('/ttk91web/worker.js');

    this.messageId = 0;
    this.promises = {};

    this.worker.addEventListener('message', this.onMessage.bind(this));

    this.stack = [];
    this.output = [];
    Vue.util.defineReactive(this, '_registers', []);
    Object.defineProperty(this, 'registers', {
      get () { return this._registers; }
    });
  }

  postMessage(type, payload, expectResponse) {
    if (arguments.length == 2)
      expectResponse = false;

    let id = this.messageId++;

    this.worker.postMessage({
      id,
      type,
      payload,
    });

    if (expectResponse) {
      return new Promise((resolve, reject) => {
        this.promises[id] = { resolve, reject };
      });
    }
  }

  async onMessage ({ data }) {
    if ('id' in data) {
      let promise = this.promises[data.id];

      if (promise !== undefined) {
        promise.resolve(data);
      }
    } else {
      console.log(data);
      this.dispatchMessage(data.type, data);
    }
  }

  execute (program) {
    this.postMessage('load', { program });
  }

  run () {
    this.postMessage('run');
  }

  step () {
    this.postMessage('step');
  }

  stop () {
    this.worker.terminate();
    this.worker = new Worker('/ttk91web/worker.js');
    this.load(store.state.assembly);
  }

  readAddress (address) {
    return this.postMessage('readAddress', { address }, true);
  }

  @messageHandler('output')
  onOutput ({ registers, output, line }) {
    store.commit('setOutput', { output });
    store.commit('setExecutionLine', { line });
  }

  @messageHandler('setRegisters')
  onSetRegisters ({ registers }) {
    store.commit('resetEmulator', { registers });
  }

  @messageHandler('event')
  async onEmulatorEvent ({ kind, payload }) {
    await this.dispatchEvent(kind, payload);
  }

  @eventHandler('register-change')
  async onRegisterChange ({ register, data }) {
    store.commit('setRegister', { register, data });

    if (register === 7) {
      await this.updateStack(data)
    }
  }

  async updateStack (newStackPointer) {
    await store.dispatch('updateStack', {
      address: newStackPointer,
    });
  }
}

const EMULATOR = new Emulator();
export default EMULATOR;

