import * as wasm from "ttk91-wasm";

wasm.init_panic_hook();

window.execute_ttk91 = wasm.execute;
console.log(wasm.execute("LOAD R1, =1\nADD R1, =2\nOUT R1, =0\nSVC SP, =HALT\n"));

document.getElementById('execute')
	.addEventListener('click', (evt) => {
		let code = document.getElementById('code').value;
		console.log(code);
		let emulator = wasm.create_emulator(code);

		while (true) {
			console.log(emulator.registers());
			emulator.step();
		}

		document.getElementById('output').innerText = output;
	});
