import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

const PREFIX = "r=";

/**
 * Takes a roster text block and turns it into a URL hash
 */
export function encodeRosterToHash(rosterText: string): string {
  const payload = compressToEncodedURIComponent(rosterText);
  return `#${PREFIX}${payload}`;
}

/**
 * Reads the roster from the URL hash and decodes it
 */
export function decodeRosterFromHash(hash: string): string | null {
  if (!hash?.startsWith(`#${PREFIX}`)) return null;

  const payload = hash.slice(`#${PREFIX}`.length);
  const decoded = decompressFromEncodedURIComponent(payload);

  return decoded || null;
}
