/**
 * @module Messages
 */

/**
 * Namespace used for messages originating from the web worker.
 * @type {string}
 */
export const MESSAGE_NAMESPACE = 'message';

/**
 * Namespace used for events originating from the emulator.
 * @type {string}
 */
export const EVENT_NAMESPACE = 'event';

/**
 * Defines a message type with it's fully qualified name.
 * Wildcards `*` are supported for both {@link namespace} and {@link name}.
 *
 * @typedef EventDescriptor
 * @template Payload
 * @prop {string} namespace - Namespace into which this message belongs.
 * @prop {string} name - Name of the event or message.
 */

/**
 * @type {module:Messages~EventDescriptor.<module:Messages~event:MemoryChangeEvent>}
 */
export const MEMORY_CHANGE_EVENT = {
  namespace: EVENT_NAMESPACE,
  name: 'memory-change',
};

/**
 * Event emitted by the emulator every time when a memory location
 * changes it's value.
 *
 * @event module:Messages~MemoryChangeEvent
 * @prop {number} address - Address of the changed memory location.
 * @prop {number} value - The new value of the memory location.
 */

/**
 * @type {module:Messages~EventDescriptor.<module:Modules~event:RegisterChangeEvent>}
 */
export const REGISTER_CHANGE_EVENT = {
  namespace: EVENT_NAMESPACE,
  name: 'register-change',
};

/**
 * Event emitted by the emulator every time value of a register changes.
 *
 * @event module:Messages~RegisterChangeEvent
 * @prop {number} register - Index of the changed working register.
 * @prop {number} value - The new value of the register.
 */

/**
 * @type {module:Messages~EventDescriptor<module:Messages~event:SetSymbolTableMessage>}
 */
export const SET_SYMBOL_TABLE_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'setSymbolTable',
};

/**
 * Message sent by the worker whenever an updated symbol table is available.
 *
 * @event module:Messages~SetSymbolTableMessage
 * @prop {Object<string, number>} symbols - The symbol table.
 */

/**
 * @type {module:Messages~EventDescriptor<module:Messages~event:SetRegistersMessage>}
 */
export const SET_REGISTERS_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'setRegisters',
};

/**
 * Message sent by the worker when the registers need to be initialised.
 *
 * @event module:Messages~SetRegistersMessage
 * @prop {number[]} registers - New values for all working registers.
 */

/**
 * @type {module:Messages~EventDescriptor<module:Messages~event:OutputMessage>}
 */
export const OUTPUT_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'output',
};

/**
 * Message sent by the worker when new output is available.
 *
 * @event module:Messages~OutputMessage
 * @prop {number} line - The current source code line of execution.
 * @prop {number[]} output - All values printed during the current
 *    program's execution.
 * @prop {number[]} registers - Current values of all the working registers.

/**
 * @type {module:Messages~EventDescriptor<module:Messages~event:EventMessage>}
 */
export const EVENT_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'event',
};

/**
 * Message sent by the worker every time the emulator emits an event.
 *
 * @event module:Messages~EventMessage
 * @prop {string} kind - Name of the event type.
 * @prop {Object} payload - Event payload.
 */

/**
 * @type {module:Messages~EventDescriptor<module:Messages~event:UpdateStackPointerMessage>}
 */
export const UPDATE_STACK_POINTER_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'updateStackPointer',
};

/**
 * Message sent by the worker whenever the stack point needs to be explicitly
 * updated.
 *
 * @event module:Messages~UpdateStackPointerMessage
 */

/**
 * @type {module:Messages~EventDescriptor<module:Messages~event:AddressResponseMessage>}
 */
export const ADDRESS_RESPONSE_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'addressResponse',
};

/**
 * Message sent by the worker in response to an {@link ADDRESS_QUERY_MESSAGE}.
 *
 * @event module:Messages~AddressResponseMessage
 * @prop {number} address - Address of the memory location from which this
 *    value was read from.
 * @prop {number} value - The queried value from the emulator's virtual memory.
 */

/**
 * @type {module:Messages~EventDescriptor<module:Messages~event:AddressQueryMessage>}
 */
export const ADDRESS_QUERY_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'addressQuery',
};

/**
 * Message sent from the main thread to the worker that queries the current value
 * of a specified memory location.
 *
 * @event module:Messages~AddressQueryMessage
 * @prop {number} address - Address of the memory location whose value
 *    is being queried.
 */
