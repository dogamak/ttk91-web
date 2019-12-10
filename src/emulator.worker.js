var ttk91 = null;

import('ttk91-wasm')
  .then((_ttk91) => {
    ttk91 = _ttk91;
    console.log(ttk91);
  }, (err) => {
    console.log(err);
  });

//var emulator = ttk91.emulator();

self.addEventListener('message', (msg) => {
  import('ttk91-wasm')
    .then((ttk91) => console.log('ttk91 loaded!'));
  console.log(`Hello, ${msg.data.who}!`);
  console.log(ttk91);
});
