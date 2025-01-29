import { v4 as uuidv4 } from "uuid";

export function generateUUID() {
    return uuidv4();
}

export function areUUIDsEqual(uuid1, uuid2) {
  if (uuid1.length !== uuid2.length) return false;
  return uuid1.every((byte, index) => byte === uuid2[index]);
}

