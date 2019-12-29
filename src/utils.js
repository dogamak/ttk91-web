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

/**
 * @typedef {Object} Rectangle
 * @prop {number} x - X-coordinate of the top-left corner.
 * @prop {number} y - Y-coordinate of the top-left corner.
 * @prop {number} width - Width of the rectangle.
 * @prop {number} height - Height of the rectangle.
 */

/**
 * Calculates the intersection of the specified rectangles.
 *
 * @param {Rectangle} rect1
 * @param {Rectangle} rect2
 * @param {...Rectangle} rects
 * @return {Rectangle}
 */
export function intersection(rectA, rectB, ...rest) {
  const x = Math.max(rectA.x, rectB.x);
  const y = Math.max(rectA.y, rectB.y);

  const width = Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - x;
  const height = Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - y;

  const result = { x, y, width, height };

  if (rest.length > 0) {
    return intersection(result, ...rest);
  }

  return result;
}
