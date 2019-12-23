import Vue from 'vue';
import Vuex from 'vuex';
import store from './store.js';

import { Dispatcher, scopedListener } from './listener.js';
import {
  MESSAGE_NAMESPACE,
  EVENT_NAMESPACE,
  MEMORY_CHANGE_EVENT,
  REGISTER_CHANGE_EVENT,
  SET_REGISTERS_MESSAGE,
  SET_SYMBOL_TABLE_MESSAGE,
  OUTPUT_MESSAGE,
  EVENT_MESSAGE,
} from './messages.js';

import { Many } from '@/utils.js';

/**
 * Scoped listener associated with
 * {@link module:Messages.MESSAGE_NAMESPACE|MESSAGE_NAMESPACE}
 * which is used for messages originating from the web worker.
 *
 * @type {ScopedListener}
 */
const MessageListener = scopedListener(MESSAGE_NAMESPACE);

/**
 * Scoped listener associated with
 * {@link module:Messages.EVENT_NAMESPACE|EVENT_NAMESPACE}
 * which is used for events originating from the emulator.
 *
 * @type {ScopedListener}
 */
const EventListener = scopedListener(EVENT_NAMESPACE);


let worker = new Worker('/ttk91web/worker.js');

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

/**
 * Index number of the register used for storing the stack pointer.
 */
const STACK_POINTER_REGISTER = 7;

/**
 * Class for getting a reactive view into the emulator's virtual memory.
 */
class MemoryWatcher extends EventListener {
  /**
   * Create a new instance that is associated with the provided {@link Emulator}
   * instance.
   */
  constructor (emulator) {
    super();
    this.emulator = emulator;
    this.emulator.register(MEMORY_CHANGE_EVENT, this);

    /**
     * Map that contains the watched memory addresses end their values.
     * This map is updated automatically and is reactive when used in Vue
     * components.
     *
     * @name MemoryWatcher#addresses
     * @type {Object<number, number>}
     */
    Vue.util.defineReactive(this, 'addresses', {});
  }

  /**
   * Add an address into the list of watched addresses.
   * If the value of that address if in the cache, update
   * {@link MemoryWatcher#addresses} immediately. Otherwise, query the web worker for
   * the value. The returned promise resolves after the address has been updated.
   *
   * @param {number} address - Address of the memory location whose value will be
   *    added into {@link MemoryWatcher#addresses} and kept up-to-date.
   * @return {Promise}
   */
  async watch (address) {
    await this.emulator.refreshAddress(address);
    Vue.set(this.addresses, address, this.emulator.memory[address]);
  }
  
  /**
   * Stop changes in the specified memory location from triggering updates.
   *
   * @param {number} address - Address of the memory location.
   */
  unwatch (address) {
    Vue.set(this.addresses, address, undefined);
  }

  /**
   * Unregisters this instance from the {@link Emulator} and clears
   * {@link MemoryWatcher#addresses}. Not calling this will lead to a memory leak
   * as the Emulator holds a reference to this instance.
   */
  destroy () {
    this.emulator.unregister(MEMORY_CHANGE_EVENT, this);
    this.adresses = {};
  }

  /**
   * Event handler that is called every time a memory location changes value.
   * If the changed memory location is registered as being watched on this instance,
   * updates {@link MemoryWatcher#addresses}.
   *
   * @listens module:Messages~event:MemoryChangeEvent 
   * @param {module:Messages~event:MemoryChangeEvent} event - Event object.
   */
  @EventListener.handler(MEMORY_CHANGE_EVENT)
  onMemoryChange ({ address, value }) {
    if (address in this.addresses) {
      Vue.set(this.addresses, address, value);
    }
  }
}

/**
 * An emulator instance running as a separate thread in a web worker.
 */
export class Emulator extends Many(Dispatcher, EventListener, MessageListener) {
  /**
   * Spawns a new web worker for the emulator and registers neccessary
   * callbacks to it.
   */
  constructor () {
    super();

    /**
     *
     * @name Emulator#worker
     * @type {Worker}
     */
    this.worker = new Worker('/ttk91web/worker.js');

    this.worker.addEventListener('message', this.onMessage.bind(this));

    /**
     * @name Emulator#messageId
     * @type {number}
     */
    this.messageId = 0;

    /**
     * @name Emulator#promises
     * @type {Object<number, Promise>}
     */
    this.promises = {};

    this.watchers = {};

    this.register({ name: '*', namespace: '*' }, this);

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
   * Refresh the memory cache at the specified address.
   * If the cache contains no data for that memory location, sends a query to the
   * web worker and populates the cache with the response.
   *
   * @param {number} address - Address of the memory location whose value will be
   *    refreshed.
   * @return {Promise} Promise that resolves after the memory location has been
   *    refreshed. The fresh value can be accessed normally through
   *    {@link Emulator#memory}.
   */
  async refreshAddress (address) {
    if (this.memory[address] === undefined) {
      //console.log(address);
      //this.memory[address] = null;
      let response = await this.readAddress(address);
      //this.memory[address] = response.payload.value;
      Vue.set(this.memory, address, response.payload.value);
    }
  }

  /**
   * Constructs a {@link MemoryWatcher} instance that is tied to this
   * {@link Emulator} instance.
   */
  getWatcher () {
    return new MemoryWatcher(this);
  }

  /*
   * Register a wathcer for a memory location.
  watchAddress (address, watcher) {
    let watcherId = hyperid();
    this.watchers.set(watcherId, watcher);
    
    if (address in this.locationWatchers) {
      this.locationWatchers[address].push(watcher)
    } else {
      this.locationWatchers[address] = [watcher];
    }
  }*/

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
        this.stack.pop();
        delete this.stackMetadata[addr];
      }
    }
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
      this.dispatch({
        namespace: MESSAGE_NAMESPACE,
        name: data.type
      }, data);
    }
  }

  /**
   * Compile and load a program into the emulator.
   * 
   * @param {string} program - The assembly code for the program.
   */
  execute (program) {
    this.postMessage('load', { program });
    this.memory = {};
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
   * @listens module:Messages~event:OutputMessage
   * @param {module:Messages~event:OutputMessage} message - The message object.
   */
  @MessageListener.handler(OUTPUT_MESSAGE)
  onOutput ({ registers, output, line }) {
    this.output = output;
    this.executionLine = line;
  }

  /**
   * Message handler that is called whenever all emulator's registers are reset.
   *
   * @listens module:Messages~event:SetRegistersMessage
   * @param {module:Messages~event:SetRegistersMessage} message - The message object.
   */
  @MessageListener.handler(SET_REGISTERS_MESSAGE)
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
   * @listens module:Messages~event:EventMessage
   * @param {module:Messages~event:EventMessage} message - The message object.
   */
  @MessageListener.handler(EVENT_MESSAGE)
  async onEmulatorEvent ({ kind, payload }) {
    this.dispatch({ namespace: EVENT_NAMESPACE, name: kind }, payload);
  }

  /**
   * Event handler that is called whenever a register's value changes.
   *
   * @listens module:Messages~event:RegisterChangeEvent
   * @param {module:Messages~event:RegisterChangeEvent} event - The event object.
   */
  @EventListener.handler(REGISTER_CHANGE_EVENT)
  onRegisterChange ({ register, data }) {
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
   *
   * @listens module:Messages~event:MemoryChangeEvent
   * @param {module:Messages~event:MemoryChangeEvent}
   */
  @EventListener.handler(MEMORY_CHANGE_EVENT)
  onMemoryChange({ address, data }) {
    Vue.set(this.memory, address, data);

    if (address <= this.stackBaseAddress && address > this.stackPointer) {
      let i = this.stackBaseAddress - address;
      Vue.set(this.stack, i, data);
    }
  }

  /**
   * Message handler that is called whenever we receive a new symbol table.
   *
   * @listens module:Messages~event:SetSymbolTableMessage
   * @param {module:Messages~event:SetSymbolTableMessage}
   */
  @MessageListener.handler(SET_SYMBOL_TABLE_MESSAGE)
  async onSetSymbolTable ({ symbols }) {
    this.symbols = symbols;

    for (let address of Object.values(symbols)) {
      let res = await this.readAddress(address);
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

