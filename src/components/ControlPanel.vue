<template>
  <div class="control-panel">
    <div class="controls">
      <input type="button" class="green" value="Load" @click="onExecute" />
      <input type="button" value="Run" @click="onRun" />
      <input type="button" value="Step" @click="onStep" />
      <input type="button" value="Stop" @click="onStop" />
    </div>
    <div class="registers-container">
      <h3>Registers:</h3>
      <div class="registers">
        <table>
          <tr>
            <th></th>
            <th>Decimal</th>
            <th>Hexadecimal</th>
            <th>Binary</th>
          </tr>
          <tr v-for="register in registers">
            <th>{{register.name}}</th>
            <td>{{register.value}}</td>
            <td>{{leftPad(register.value.toString(16), '0', 4)}}</td>
            <td>{{leftPad(register.value.toString(2), '0', 16)}}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="state-container">
      <h3>Flags:</h3>
      Current line: {{ executionLine }}
    </div>
    <h3>Output:</h3>
    <div class="output">
      <div v-for="item in output">
        <div class="decimal">
          {{item}}
        </div>
        <div class="hexadecimal">
          0x{{leftPad(item.toString(16), '0', 4)}}
        </div>
        <div class="binary">
          0b{{leftPad(item.toString(2), '0', 16)}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as emulator from '../emulator.js';

  export default {
    name: 'ControlPanel',
    methods: {
      onExecute () {
        emulator.execute(this.$store.state.assembly);
      },
      onStep () {
        emulator.step();
      },
      onRun () {
        emulator.run();
      },
      onStop () {
        emulator.stop();
      },
      leftPad (str, pad, len) {
        while (str.length < len) {
          str = pad + str;
        }
        return str;
      }
    },
    computed: {
      registers () {
        let registers = [];

        for (let i = 0; i < 8; i++) {
          registers.push({
            name: `R${i+1}`,
            value: this.$store.state.registers[i] || 0,
          });
        }

        return registers;
      },

      output () {
        let output = [];

        for (let i = 0; i < this.$store.state.output.length; i++) {
          output.push(this.$store.state.output[i]);
        }

        return output;
      },
      executionLine () {
        return this.$store.state.executionLine;
      }
    },
  };
</script>

<style>
  .control-panel {
    padding: 2em;
    color: #222;
    font-family: sans-serif;
  }

  h3 {
    margin-left: -0.75em;
  }

  .registers table td, .registers table th {
    width: 5em;
    padding: 0.2em;
    height: 1em;
    line-height: 1.5em;
  }

  .registers table {
    border-radius: 3px;
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd;
    margin-top: 1em;
    font-family: sans-serif;
    border-spacing: 0px 0px;
  }

  .registers table tr:first-child th:not(:first-child) {
    border-top: 1px solid #ddd;
  }

  .registers table tr:not(:first-child) th {
    border-left: 1px solid #ddd;
  }

  .registers table tr:not(:first-child) th,
  .registers table tr:first-child th:not(:first-child)
  {
    color: #333;
    background-color: #e8e8e8;
    text-align: center;
  }

  .registers table tr:nth-child(2) th {
    border-top-left-radius: 3pt;
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }

  .registers table tr:first-child th:nth-child(2) {
    border-top-left-radius: 3pt;
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }

  .registers table td:first-child {
    text-align: right;
    padding: 0 0.5em;
  }

  .registers table td {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .registers table td:not(:last-child) {
      border-right: 1px solid #ddd;
  }

  .output > div {
    padding: 0 0.5em;
  }

  .output > div:hover {
    background-color: rgba(255,255,255,0.04);
  }

  .output > div > div {
    display: inline-block;
  }

  .output > div:not(:hover) > div:not(.decimal) {
    display: none;
  }

  .output .decimal {
    width: 5em;
  }
  
  .output .hexadecimal {
    margin-right: 2em;
    color: #aaa;
  }

  .output .binary {
    color: #aaa;
  }

  input[type="button"] {
    background-color: #e8e8e8;
    border: 1px solid #ddd;
    border-radius: 3pt;
    height: 3em;
    padding: 0 1em;
    font-weight: bold;
    box-shadow: 0px 2px 1px 0px rgba(0,0,0,0.2);
  }

  input[type="button"].green {
    background-color: #61b761;
    border-color: #5b9d5b;
    color: white;
    font-weight: bold;
    }

  .output span {
    display: block;
  }

  .output {
    background-color: #333;
    border-radius: 3pt;
    border: 1px solid black;
    color: #eee;
    padding: 0.5em 0;
    font-family: monospace;
    font-size: 1rem;
    max-width: 30em;
    min-height: 5em;
  }
</style>
