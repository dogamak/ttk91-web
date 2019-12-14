export function leftPad(str, pad, len) {
  while (str.length < len) {
    str = pad + str;
  }
  return str;
}

