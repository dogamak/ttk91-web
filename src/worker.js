import('ttk91').then((wasm) => {
  let emulator = null;
  let messageQueue = [];

  self.addEventListener('message', (evt) => {
    let halted = false;

    if (evt.data.type === 'load') {
      emulator = wasm.create_emulator(evt.data.program);
      console.log(emulator);
    } else if (evt.data.type === 'run') {
      halted = false;

      while (!halted) {
        let output = emulator.step();

        if (output.calls().indexOf(11) != -1) {
          halted = true;
        }

        self.postMessage({
          type: 'output',
          output: output.output(),
          registers: emulator.registers(),
          line: output.line,
        });
      }
    } else if (evt.data.type === 'stop') {
      halted = true;
    } else if (evt.data.type === 'step') {
      let output = emulator.step();

      self.postMessage({
        type: 'output',
        output: output.output(),
        registers: emulator.registers(),
        line: output.line,
      });
    }
  });
}, (err) => console.error(err));
