<p align="center"><img src="assets/ttk91web-colored.svg" /></p>
<p align="center">
  <a href="https://travis-ci.com/dogamak/ttk91-web">
    <img src="https://travis-ci.com/dogamak/ttk91-web.svg?token=9iyfi5y6puZMvv9MzzXy&branch=master" />
  </a>
  <img src="https://img.shields.io/badge/version-v0.1.0--alpha7-blue" />
  <a href="https://karhusaari.me/ttk91web/"><img src="https://img.shields.io/badge/try%20it-here-blue" /></a>
</p>

## Overview
`TTK91Web` is fully fledged TTK91 emulator, development environment and debugger running locally in your browser.
This is made possible by [`ttk91-rs`](https://github.com/dogamak/ttk91-rs), a rust library for parsing, compiling and emulating TTK91 code, and [`ttk91-wasm`](https://github.com/dogamak/ttk91-wasm) which provides WebAssembly bindings for `ttk91-rs`.

## Features
- Syntax highlighted editor based on [Ace](https://ace.c9.io/) by [cloud9](https://c9.io/).
- Syntax linting and helpful syntax error messages.
- Stepping instruction-by-instruction.
- Highlights the source code line currently in execution.
- Shows the state of registers and the stack in real-time.

## Installation
Local development server can be started with `npm run start`.

Running `npm run build` builds the project, after which the directory `dist/` contains all files needed for deployment. Notice that all application logic resides in the user's browser and the project has no back-end. All you need to do for a fully functioning production setup is to serve these files with Nginx, Apache or other standard HTTP server. You might need to configure the server to serve WebAssembly `.wasm` files with the MIME type `application/wasm` instead of `application/octet-stream`.
