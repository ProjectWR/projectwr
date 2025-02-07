/* c8 ignore start */

import { object } from "lib0";
import { equalityStrict } from "lib0/function";

/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
export const equalityCustomDepth = (a, b, maxDepth, currentDepth = 0) => {
  if (currentDepth > maxDepth) {
    return true;
  }

  if (a == null || b == null) {
    return equalityStrict(a, b);
  }
  if (a.constructor !== b.constructor) {
    return false;
  }
  if (a === b) {
    return true;
  }
  switch (a.constructor) {
    case ArrayBuffer:
      a = new Uint8Array(a);
      b = new Uint8Array(b);
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      break;
    }
    case Set: {
      if (a.size !== b.size) {
        return false;
      }
      for (const value of a) {
        if (!b.has(value)) {
          return false;
        }
      }
      break;
    }
    case Map: {
      if (a.size !== b.size) {
        return false;
      }
      for (const key of a.keys()) {
        if (!b.has(key) || !equalityCustomDepth(a.get(key), b.get(key), maxDepth, currentDepth + 1)) {
          return false;
        }
      }
      break;
    }
    case Object:
      if (object.length(a) !== object.length(b)) {
        return false;
      }
      for (const key in a) {
        if (!object.hasProperty(a, key) || !equalityCustomDepth(a[key], b[key], maxDepth, currentDepth + 1)) {
          return false;
        }
      }
      break;
    case Array:
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!equalityCustomDepth(a[i], b[i], maxDepth, currentDepth + 1)) {
          return false;
        }
      }
      break;
    default:
      return false;
  }
  return true;
};