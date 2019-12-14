import store from './store.js';
export let worker = new Worker('/ttk91web/worker.js');

worker.postMessage({
  who: 'Jorma',
});

worker.addEventListener('message', (evt) => {
  if (evt.data.type === 'output') {
    store.commit('setRegisters', {
      registers: evt.data.registers,
    });

    store.commit('setOutput', {
      output: evt.data.output,
    });

    store.commit('setExecutionLine', {
      line: evt.data.line,
    });
  }
});

export function execute(program) {
  worker.postMessage({
    type: 'load',
    program,
  });
}

export function step() {
  worker.postMessage({
    type: 'step',
  });
}

export function run() {
  worker.postMessage({
    type: 'run',
  });
}

export function stop() {
  worker.terminate();
  worker = new Worker('/ttk91web/worker.js');
  worker.postMessage({
    type: 'load',
    program: store.state.assembly,
  });
}
