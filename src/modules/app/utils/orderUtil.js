// Positions are represented as a string containing the digits after "0." in
// the fractional position between 0 and 1. So a position of "304" represents
// a position of "0.304".

// This returns a position that is between the positions "before" and "after".
// Missing elements (i.e. when there is no position before, or no position
// after) are represented by passing an empty string for the missing position
// instead. So "insertBetween('', positions[0])" inserts at the front and
// "insertBetween(positions[positions.length - 1], '')" inserts at the back.
export function insertBetween(before, after) {
  console.log("before:", before, "after ", after);
  // This demo uses "0" as the first digit and "9" as the last digit for
  // ease of understanding. However, this algorithm is best done with as
  // large a base as possible to keep the generated positions shorter. A
  // production implementation might make each digit a full byte, so the
  // first digit would be 0x00 and the last digit would be 0xFF.
  const minDigit = "0".charCodeAt(0);
  const maxDigit = "9".charCodeAt(0);

  let foundDifference = false;
  let result = "";
  let i = 0;

  // Note: There are many ways to pick a fraction between two other
  // fractions. The code below is just one way to do it, but it's
  // certainly not the only way. Feel free to do this differently if
  // you'd like.
  while (true) {
    // Pretend all digits past the end of the "before" position are
    // "0" (our minimum digit).
    const digitBefore = i < before.length ? before.charCodeAt(i) : minDigit;

    // Pretend all digits past the end of the "after" position are
    // "10" (one past our maximum digit). We do this because generated
    // digits must be less than this number and we want to be able to
    // generate "maxDigit" at the end of a generated position.
    const digitAfter =
      !foundDifference && i < after.length ? after.charCodeAt(i) : maxDigit + 1;

    // Try to split the difference at the halfway point. This will round down,
    // and only the upper value is ever equal to "maxDigit + 1", so the halfway
    // point will always be less than or equal to "maxDigit".
    const pick = (digitBefore + digitAfter) >>> 1;
    result += String.fromCharCode(pick);

    // If the difference is too small, continue to the next digit. We don't
    // need to test the upper number since the division by two always rounds
    // down. So if it's greater than the lower bound, then it must therefore
    // also be less than the upper bound.
    if (pick <= digitBefore) {
      // If the rounded halfway point is equal to the "before" digit but the
      // "before" and "after" digits are different, then the difference between
      // them must be 1. In that case we want to treat all remaining "after"
      // digits as larger than the maximum digit value since we have reached the
      // end of the common shared prefix.
      //
      // For example, for "0.19" and "0.23" we won't be able to generate a digit
      // in between "1" and "2" so we need to continue to the next digit pair,
      // but we don't want to try to average "9" and "3" to get a digit since
      // the next digit must be greater than or equal to "9". So instead we want
      // to average "9" and a value greater than the maximum digit (i.e. "10").
      if (digitBefore < digitAfter) {
        foundDifference = true;
      }

      i += 1;
      continue;
    }

    // Otherwise, return the halfway point plus random jitter to avoid
    // collisions in the case where two peers try to concurrently insert
    // between the same positions.
    //
    // The random jitter is added as random extra digits past the end of the
    // fraction. This will never push the generated position past "next"
    // because we know that "pick" is already less than "next". For example,
    // "0.014abc" is always less than "0.015xyz" for all "abc" and "xyz".
    // This implementation avoids unnecessarily append trailing "0" digits
    // to the end.
    //
    // Note that the fact that the random jitter is always a non-negative
    // number will bias the result slightly. This doesn't matter when we
    // use a large base so the bias is small. The bias only really matters
    // for smaller bases such as base 2.
    let jitter = Math.floor(Math.random() * 0x1000);
    while (jitter > 0) {
      const base = maxDigit - minDigit + 1;
      const mod = jitter % base;
      jitter = (jitter - mod) / base;
      result += String.fromCharCode(minDigit + mod);
    }

    console.log("result", result);
    return result;
  }
}

/**
 * Constructs an ordered array of objects based on their positions.
 *
 * @param {[[]]} array - The array of objects to be ordered.
 * @returns {[[]]} - An array of objects sorted by their positions.
 */
export function sortArrayByOrder(array) {
  // Note: It's possible to update the sorted state incrementally, which
  // is more efficient. However, doing this involves a) batching changes
  // instead of applying them one-at-a-time and b) more code to do the
  // state update. So this has been left out for simplicity in the demo.

  return array.sort((a, b) => {
    // Sort by position using the object identifier as a tie-breaker
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });
}

/**
 * gets the highest order index in the array
 *
 * @param {[[]]} array -
 * @returns {number} -
 */
export function getHighestOrderIndex(array) {
  console.log("checking in orderutil", array);

  if (array.length === 0) return "";

  const highestOrderIndex = array.reduce((accumulator, currentValue) => {
    if (currentValue[1] > accumulator) {
      return currentValue[1];
    }

    return accumulator;
  }, array[0][1]);

  console.log("highest order index", highestOrderIndex);
  return highestOrderIndex;
}

/**
 * gets the next order index in the array from the current item
 *
 * @param {[[]]} array -
 * @returns {number} -
 */
export function getNextOrderIndex(key, array) {
  console.log("checking in orderutil for next order index", array);


  if (array.length === 0) return "";

  const currentItemOrderIndex = array.find((item) => item[0] === key)[1];

  console.log("current item order index", currentItemOrderIndex);

  const nextOrderIndex = array.reduce((accumulator, currentValue) => {
    if (accumulator === "") {
      if (currentValue[1] > currentItemOrderIndex) {
        return currentValue[1];
      } else {
        return accumulator;
      }
    }

    if (
      currentValue[1] < accumulator &&
      currentValue[1] > currentItemOrderIndex
    ) {
      return currentValue[1];
    }

    return accumulator;
  }, "");

  console.log("next order index", nextOrderIndex);
  return nextOrderIndex;
}

/**
 * gets the next order index in the array from the current item
 *
 * @param {[[]]} array -
 * @returns {number} -
 */
export function getPreviousOrderIndex(key, array) {
  console.log("checking in orderutil for previous order index", array);

  if (array.length === 0) return "";

  const currentItemOrderIndex = array.find((item) => item[0] === key)[1];

  console.log("current item order index", currentItemOrderIndex);

  const previous = array.reduce((accumulator, currentValue) => {
    if (accumulator === "") {
      if (currentValue[1] < currentItemOrderIndex) {
        return currentValue[1];
      } else {
        return accumulator;
      }
    }

    if (
      currentValue[1] > accumulator &&
      currentValue[1] < currentItemOrderIndex
    ) {
      return currentValue[1];
    }

    return accumulator;
  }, "");

  console.log("previous order index", previous);
  return previous;
}