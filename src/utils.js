export function leftPad(str, pad, len) {
  while (str.length < len) {
    str = pad + str;
  }
  return str;
}

export function Many (...classes) {
  class Union {
    constructor (...args) {
      let constructors = [];

      for (const superClass of classes) {
        const props = Object.getOwnPropertyNames(superClass.prototype);

        console.log(superClass, props);

        for (const prop of props) {
          if (prop === 'constructor') {
            constructors.push(superClass.prototype.constructor);
          } else {
            Union.prototype[prop] = superClass.prototype[prop];
          }
        }
      }

      for (const constructor of constructors) {
        Object.assign(Union.prototype, new constructor(...args));
      }
    }
  }

  return Union;
}
