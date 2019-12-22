export const MESSAGE_NAMESPACE = 'message';

export const EVENT_NAMESPACE = 'event';

export const MEMORY_CHANGE_EVENT = {
  namespace: EVENT_NAMESPACE,
  name: 'memory-change',
};

export const REGISTER_CHANGE_EVENT = {
  namespace: EVENT_NAMESPACE,
  name: 'register-change',
};

export const SET_SYMBOL_TABLE_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'setSymbolTable',
};

export const SET_REGISTERS_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'setRegisters',
};

export const OUTPUT_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'output',
};

export const EVENT_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'event',
};

export const UPDATE_STACK_POINTER_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'updateStackPointer',
};

export const ADDRESS_RESPONSE_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'addressResponse',
};

export const ADDRESS_QUERY_MESSAGE = {
  namespace: MESSAGE_NAMESPACE,
  name: 'addressQuery',
};
