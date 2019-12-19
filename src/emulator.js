import Vue from 'vue';
import Vuex from 'vuex';
import store from './store.js';
export let worker = new Worker('/ttk91web/worker.js');

/**
 * This monstrosity is used to generate the `eventHandler` and `messageHandler`
 * decorators.  The first arguments is the name of the property where a list of
 * the listeners should be maintained.  The second argument is the name of the
 * generated dispatch method, which is used to send messages to the listeners.
 *
 * @param {string} listPropertyName - Name of the class property into which the
 *    list of callbacks will be stored.
 * @param {string} dispatchMethodName - Name for a generated method for
 *    dispatching messages to the callbacks.
 *
 * @return {function} A method decorator.
 */
function callbackRegisteringDecoratorFactory (
  listPropertyName,
  dispatchMethodName,
) {
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

/**
 * Decorator that registers the method as an message handler.
 *
 * @param {string} name - The name of the message type this method will be
 * called for.
 */
const messageHandler = callbackRegisteringDecoratorFactory(
  'messageHandlers',
  'dispatchMessage',
);

/**
 * Decorator that registers the method as an event handler.
 *
 * @param {string} name - The name of the event type this method will be
 * called for.
 */
const eventHandler = callbackRegisteringDecoratorFactory(
  'eventHandler',
  'dispatchEvent',
);

/**
 * A message from the web worker.
 *
 * @typedef {Object} Message
 * @property {string} type - The type of the message.
 * @property {number} id - The id of the message this message is response to.
 * @property {Object} payload - The payload of the message.
 */

/**
 * An event from the emulator.
 *
 * @typedef {Object} Event
 * @property {string} kind - The kind of the event.
 * @property {Object} payload - The payload of the event.
 */

/**
 * The MessageEvent interface represents a message received by a target object.
 *
 * @external MessageEvent
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent|MessageEvent at MDN}
 */

const STACK_POINTER_REGISTER = 7;

/**
 * An emulator instance running as a separate thread in a web worker.
 */
export class Emulator {
  /**
   * Spawns a new web worker for the emulator and registers neccessary
   * callbacks to it.
   */
  constructor () {
    this.worker = new Worker('/ttk91web/worker.js');

    this.messageId = 0;
    this.promises = {};

    this.worker.addEventListener('message', this.onMessage.bind(this));

    this.stack = [];
    this.output = [];

    this.watchers = {};

    /**
     * Array containing the work registers' values.
     * @name Emulator#registers
     * @type {number[]}
     */
    Vue.util.defineReactive(this, 'registers', [0,0,0,0,0,0,0]);

    /**
     * Object representing a copy of the Emulator's virtual memory.
     * Maps memory location addresses into their values.
     * @name Emulator#memory
     * @type {Object<number, number>}
     */
    Vue.util.defineReactive(this, 'memory', {});

    /**
     * The symbol table of the currently loaded program.
     * Maps symbol names into memory locations.
     * @name Emulator#symbols
     * @type {Object<string, number>}
     */
    Vue.util.defineReactive(this, 'symbols', {});

    /**
     * List of all values the program has printed during it's execution.
     * @name Emulator#output
     * @type {number[]}
     */
    Vue.util.defineReactive(this, 'output', []);

    /**
     * The source code line corresponding to the curren Program Counter.
     * @name Emulator#executionLine
     * @type {number}
     */
    Vue.util.defineReactive(this, 'executionLine', 1);

    /**
     * Object mapping stack memory addresses into metadata objects.
     * @type {number}
     * @name Emulator#stackMetadata
     * @prop {number} Emulator#stackMetadata.pushedAt -
     *    The source line number at which the value was pushed into the stack.
     */
    Vue.util.defineReactive(this, 'stackMetadata', {});

    /**
     * Array of stack values.
     * @type {number[]}
     * @name Emulator#stack
     */
    Vue.util.defineReactive(this, 'stack', []);

    /**
     * The highgest memory address of the stack.
     * @type {number}
     * @name Emulator#stackBaseAddress
     */
    Vue.util.defineReactive(this, 'stackBaseAddress', null);

    /**
     * The memory address of the stack head.
     * @type {number}
     * @name Emulator#stackPointer
     */
    Object.defineProperty(this, 'stackPointer', {
      get () {
        return this.registers[STACK_POINTER_REGISTER];
      },
    });

    /*Object.defineProperty(this, 'registers', {
      get () { return this._registers; }
    });*/
  }

  /**
   * Entrypoint for the Vue plugin.
   *
   * Defines an immutable `$emulator` property for all Vue components that
   * points to a single global Emulator instance.
   *
   * @param {Vue} vue - The Vue class.
   * @param {Object} options - Options object passed to `Vue.use`.
   */
  static install (Vue, options) {
    let emulator = new Emulator();

    Vue.mixin({
      beforeCreate () {
        this._emulator = emulator;

        Object.defineProperty(this, '$emulator', {
          get () {
            return this._emulator;
          },
        });
      },
    });
  }

  /**
   * Updates our view of the stack on stack pointer changes.
   * On stack pushes, resolves the pushed values and records
   * metadata about them (e.g. when they were pushed).
   * On stack pops, truncates the stack array.
   * 
   * @param {number} oldStackPointer - Value of the stack pointer before it
   *    changed.
   */
  updateStack (oldStackPointer) {
    if (this.stackPointer < oldStackPointer) {
      for (let addr = oldStackPointer; addr > this.stackPointer; addr--) {
        this.stack = [...this.stack, this.memory[addr]];
        Vue.set(this.stackMetadata, addr, {
          pushedOnLine: this.executionLine,
        });
      }
    } else {
      for (let addr = oldStackPointer; addr < this.stackPointer; addr++) {
        console.log('POP!');
        this.stack.pop();
        delete this.stackMetadata[addr];
      }
    }
    console.log(this.stack);
  }

  /**
   * Sends a message to the web worker.
   *
   * @param {string} type - The message type.
   * @param {object} payload - The payload of the message.
   * @param {boolean} [expectResponse=false] - Whether or not to expect a
   * response from the web worker.
   *
   * @return {(Promise<Message>|void)} Returns a Promise for receiving the
   * response if expectResponse parameter is set to true, otherwise does not
   * return a value.
   */
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

  /**
   * Callback that is invoked every time a message from the web worker is
   * received.
   *
   * @param {external:MessageEvent} event - The message event received from
   * the web worker.
   *
   * @return {Promise} Promise for awaiting the execution of a message handler.
   */
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

  /**
   * Compile and load a program into the emulator.
   * 
   * @param {string} program - The assembly code for the program.
   */
  execute (program) {
    this.postMessage('load', { program });
    this.memory = [];
    this.registers = [0, 0, 0, 0, 0, 0, 0];
    this.symbols = {};
  }

  /**
   * Start executing the loaded program until it halts or an error occurs.
   */
  run () {
    this.postMessage('run');
  }

  /**
   * Execute only the next instruction.
   */
  step () {
    this.postMessage('step');
  }

  /**
   * Stops the execution started with {@link run}.
   * Resets the state of the Emulator.
   */
  stop () {
    this.worker.terminate();
    this.worker = new Worker('/ttk91web/worker.js');
    this.execute(store.state.assembly);
  }

  /**
   * Reads a memory location from the emulator's virtual memory.
   *
   * @param {number} address - The memory location's address.
   *
   * @return {Promise<Message>} Promise resolving the response message.
   */
  readAddress (address) {
    return this.postMessage('readAddress', { address }, true);
  }

  /**
   * Message handler that is called every time the emulator has produced more
   * output.
   *
   * @param {Object} message - The message object.
   * @param {number[]} message.registers - State of the emulator's registers.
   * @param {number[]} message.output - An array containing all numbers printed
   *    by the program since it's launch.
   * @param {number} message.line - The current source code line of execution.
   */
  @messageHandler('output')
  onOutput ({ registers, output, line }) {
    this.output = output;
    this.executionLine = line;
  }

  /**
   * Message handler that is called whenever all emulator's registers are reset.
   *
   * @param {Object} message - The message object.
   * @param {number[]} message.registers - New values for all registers.
   */
  @messageHandler('setRegisters')
  onSetRegisters ({ registers }) {
    for (let i = 1; i < registers.length; i++) {
      this.onRegisterChange({
        register: i,
        data: registers[i],
      });
    }
  }

  /**
   * Message handler that is called every time the emulator emits a new event.
   * The event is dispatched further to the appropriate event handler.
   *
   * @param {Object} message - The message object.
   * @param {string} message.kind - The event kind. This determines the invoked
   *    event handler.
   * @param {Object} message.payload - The event payload.
   */
  @messageHandler('event')
  async onEmulatorEvent ({ kind, payload }) {
    await this.dispatchEvent(kind, payload);
  }

  /**
   * Event handler that is called whenever a register's value changes.
   *
   * @param {Object} event - The event object.
   * @param {number} event.register - The index of the changed register.
   * @param {number} event.data - The new value of the register.
   */
  @eventHandler('register-change')
  async onRegisterChange ({ register, data }) {
    let old = this.registers[register];

    Vue.set(this.registers, register, data);

    if (register === STACK_POINTER_REGISTER) {
      if (this.stackBaseAddress === null)
        this.stackBaseAddress = data;

      this.updateStack(old);
    }
  }

  /**
   * Event handler that is called every time a memory location changes in
   * the Emulator's virtual memory.
   *
   * Updates the value into {@link Emulator#memory}.
   * TODO: Do not track changes in which we are not interested in.
   */
  @eventHandler('memory-change')
  onMemoryChange({ address, data }) {
    Vue.set(this.memory, address, data);
  }

  /**
   * Message handler that is called whenever we receive a new symbol table.
   *
   * @param {Object} message - The message object.
   * @param {Object<string, number>} message.symbols - Map from symbol names into
   *    memory addresses.
   */
  @messageHandler('setSymbolTable')
  async onSetSymbolTable ({ symbols }) {
    this.symbols = symbols;

    for (let address of Object.values(symbols)) {
      let res = await this.readAddress(address);
      console.log(address, res);
      Vue.set(this.memory, address, res.payload.value);
    }
  }
}

/*
 * The global Emulator instance.
 *
 * @type {Emulator}
 */
const EMULATOR = new Emulator();

export default EMULATOR;

