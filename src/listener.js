import hyperid from 'hyperid';

const DEFAULT_NAMESPACE = '__default';

function toEventDescriptor(param, defaultNamespace=DEFAULT_NAMESPACE) {
  if (typeof param === 'string') {
    return {
      name: param,
      namespace: defaultNamespace,
    };
  }

  if (param.namespace === undefined) {
    param.namespace = defaultNamespace;
  }

  return param;
}

export class Dispatcher {
  constructor () {
    this._event_handlers = {};
  }

  register (event, listener) {
    let { namespace, name } = toEventDescriptor(event);

    let events = this._event_handlers[namespace];

    if (events === undefined) 
      events = this._event_handlers[namespace] = {};

    let handlers = events[name];

    if (handlers === undefined)
      handlers = events[name] = [];

    handlers.push(listener);
  }

  unregister (event, listener) {
    let { namespace, name } = toEventDescriptor(event);

    let events = this._event_handlers[namespace];

    if (events === undefined)
      return;

    let handlers = events[name];

    if (handlers === undefined)
      return;

    let i = handlers.findIndex(l => l._listenerId === listener._listenerId);

    if (i === -1)
      return;

    handlers.splice(i, 1);
  }

  getListeners(event) {
    let { namespace, name } = toEventDescriptor(event);

    let events = this._event_handlers[namespace];

    if (events === undefined)
      return [];

    return events[name] || [];
  }

  dispatch (event, payload) {
    let { namespace, name } = toEventDescriptor(event);

    let handlers = [
      ... this.getListeners({ namespace, name }),
      ... this.getListeners({ namespace: '*', name }),
      ... this.getListeners({ namespace, name: '*' }),
      ... this.getListeners({ namespace: '*', name: '*' }),
    ];


    for (let handler of handlers) {
      handler._onEvent({namespace, name}, payload);
    }
  }
}

export class Listener {
  constructor (namespace) {
    this._listenerId = hyperid();
    this._namespace = namespace;
  }

  _onEvent ({ namespace, name }, payload) {

    let events = this._handlers[namespace];

    if (events === undefined)
      return;

    let handlers = events[name];

    if (handlers === undefined)
      return;


    for (let handler of handlers) {
      handler.call(this, payload);
    }
  }

  static handler(event) {
    return (target, name, descriptor) => {
      let namespaces = target._handlers;

      if (namespaces === undefined) {
        target._handlers = namespaces = {};
      }

      if (event.namespace === undefined) {
        if (target._namespace !== undefined) {
          event.namespace = target._namespace;
        } else {
          event.namespace = DEFAULT_NAMESPACE;
        }
      }

      let events = namespaces[event.namespace];

      if (events === undefined) {
        events = namespaces[event.namespace] = {};
      }

      let handlers = events[event.name];

      if (handlers === undefined) {
        handlers = events[event.name] = [];
      }

      handlers.push(descriptor.value);
    };
  }
}

function assign (obj1, obj2) {
  let props = Object.getOwnPropertyNames(obj2);

  for (const prop of props) {
    const descriptor = Object.getOwnPropertyDescriptor(obj2, prop);
    Object.defineProperty(obj1, prop, descriptor);
  }
}

export function scopedListener(namespace) {
  function ScopedListener () {}

  assign(ScopedListener, Listener);
  assign(ScopedListener.prototype, Listener.prototype);

  //ScopedListener.prototype._namespace = namespace;

  ScopedListener.handler = function (event) {
    return Listener.handler(toEventDescriptor(event, namespace));
  };

  return ScopedListener;
}


