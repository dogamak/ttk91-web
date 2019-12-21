import {
  UPDATE_STACK_POINTER_MESSAGE,
  SET_REGISTERS_MESSAGE,
  SET_SYMBOL_TABLE_MESSAGE,
  EVENT_MESSAGE,
  OUTPUT_MESSAGE,
} from './messages.js';

/**
 * @external {ttk91wasm}
 *
 * Module providing WebAssembly bindings to the
 * {@linkcode https://github.com/dogamak/ttk91-rs|ttk91-rs} rust crate.
 *
 * @see {@link https://docs.rs/ttk91-wasm|ttk91-wasm documentation on docs.rs}
 */

/**
 * Class for managing the emulator and communicating with the main thread.
 */
class EmulatorWorker {
  /**
   * Construct an instance.
   * Registers event listeners for the web worker.
   *
   * @param {external:ttk91wasm} - The loaded `ttk91wasm` WebAssembly module.
   */
  constructor (wasm) {
    this.emulator = null;
    this.halted = false;
    this.wasm = wasm;

    self.addEventListener('message', this.onMessage.bind(this));
  }

  postMessage (message, payload) {
    let type = message;

    if (typeof type === 'object') {
      type = message.name;
    }

    self.postMessage({
      type,
      ... payload,
    });
  }

  /**
   * Reset emulator by creating a new instance.
   *
   * Sends messages for resetting the registers and other state to the main thread.
   *
   * @param {string} program - The assembly program source code.
   */
  resetEmulator (program) {
    this.emulator = this.wasm.create_emulator(program);
    this.emulator.add_listener('*', this.onEvent.bind(this));

    this.postMessage(UPDATE_STACK_POINTER_MESSAGE, {
      address: this.emulator.stack_pointer(),
    });

    this.postMessage(SET_REGISTERS_MESSAGE, {
      registers: this.emulator.registers(),
    });

    this.postMessage(SET_SYMBOL_TABLE_MESSAGE, {
      symbols: this.emulator.symbol_table(),
    });
  }

  /**
   * Callback that is called every time a message is received from the main thread.
   *
   * @param {external:MessageEvent} evt - The message.
   */
  onMessage (evt) {
    let method = this[evt.data.type].bind(this);

    if (method === undefined)
      return;

    let result = method(evt.data.payload);

    if (result === undefined)
      return;

    this.postMessage({
      id: evt.data.id,
      payload: result,
    });
  }

  /**
   * Callback that is called every time the emulator emits an event.
   *
   * @param {Object} event - The event object.
   * @param {string} event.type - The event type.
   * @param {Object} event.payload - The event payload whose schema depends on the event type.
   */
  onEvent ({ type, payload }) {
    this.postMessage(EVENT_MESSAGE, {
      kind: type,
      payload,
    });
  }

  /**
   * Message handler for message type `load`.
   *
   * Compiles and loads a program into the emulator.
   * Currently implemented by creating a new emulater altogether.
   *
   * @param {Message} message - The message object.
   * @param {string} message.program - The program source code.
   */
  load ({ program }) {
    console.log(program);
    this.resetEmulator(program);
  }

  /**
   * Message handler for message type `run`.
   *
   * Starts execting the loaded program until the program halts
   * or the execution is halted by the user.
   */
  run () {
    this.halted = false;

    while (!this.halted) {
      let output = this.step();

      console.log(output.calls());
      if (output.calls().indexOf(11) != -1) {
        this.halted = true;
      }
    }
  }

  /**
   * Message handler for message type `stop`.
   *
   * Halts the execution.
   */
  stop () {
    this.halted = true;
  }

  /**
   * Message handler for message type `step`.
   *
   * Executes a single instruction.
   */
  step () {
    let old_sp = this.emulator.stack_pointer();
    let output = this.emulator.step();

    this.postMessage(OUTPUT_MESSAGE, {
      output: output.output(),
      registers: this.emulator.registers(),
      line: output.line,
    });

    if (old_sp != this.emulator.stack_pointer()) {
      this.postMessage(UPDATE_STACK_POINTER_MESSAGE, {
        address: this.emulator.stack_pointer(),
      });
    }

    return output;
  }

  /**
   * Message handler for message type `readAddress`.
   *
   * Queries the value of a memory location.
   * Sends a message to the main thread as a response.
   *
   * @param {Object} message - The message object.
   * @param {number} message.address - The address of the memory location.
   */
  readAddress ({ address }) {
    let value = this.emulator.read_address(address);

    return { address, value };
  }
}

import('ttk91').then((wasm) => {
  wasm.init_panic_hook();
  new EmulatorWorker(wasm);
}, (err) => console.error(err));
