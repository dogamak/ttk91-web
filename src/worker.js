class EmulatorWorker {
  constructor (wasm) {
    this.emulator = null;
    this.halted = false;
    this.wasm = wasm;

    self.addEventListener('message', this.onMessage.bind(this));
  }

  resetEmulator (program) {
    this.emulator = this.wasm.create_emulator(program);
    this.emulator.add_listener('register-change', this.onEvent.bind(this));

    self.postMessage({
      type: 'update_stack_pointer',
      address: this.emulator.stack_pointer(),
    });

    self.postMessage({
      type: 'setRegisters',
      registers: this.emulator.registers(),
    });
  }

  onMessage (evt) {
    let method = this[evt.data.type].bind(this);

    if (method === undefined)
      return;

    let result = method(evt.data.payload);

    if (result === undefined)
      return;

    self.postMessage({
      id: evt.data.id,
      payload: result,
    });
  }

  onEvent ({ type, payload }) {
    self.postMessage({
      type: 'event',
      kind: type,
      payload,
    });
  }

  load ({ program }) {
    console.log(program);
    this.resetEmulator(program);
  }

  run () {
    this.halted = false;

    while (!halted) {
      this.step();

      if (output.calls().indexOf(11) != -1) {
        this.halted = true;
      }
    }
  }

  stop () {
    this.halted = true;
  }

  step () {
    console.log('STEP');
    let old_sp = this.emulator.stack_pointer();
    let output = this.emulator.step();

    self.postMessage({
      type: 'output',
      output: output.output(),
      registers: this.emulator.registers(),
      line: output.line,
    });

    if (old_sp != this.emulator.stack_pointer()) {
      self.postMessage({
        type: 'update_stack_pointer',
        address: this.emulator.stack_pointer(),
      });
    }
  }

  readAddress ({ address }) {
    let value = this.emulator.read_address(address);

    return { address, value };
  }
}

import('ttk91').then((wasm) => {
  wasm.init_panic_hook();
  new EmulatorWorker(wasm);
}, (err) => console.error(err));
