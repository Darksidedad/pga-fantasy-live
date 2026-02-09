import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

const PREFIX = "r=";

export function encodeRosterToHash(rosterText: string) {
  const payload = compressToEncodedURIComponent(rosterText || "");
  return `#${PREFIX}${payload}`;
}

export function decodeRosterFromHash(hash: string): string | null {
  if (!hash?.startsWith(`#${PREFIX}`)) return null;
  const payload = hash.slice((`#${PREFIX}`).length);
  const decoded = decompressFromEncodedURIComponent(payload);
  return decoded || null;
}
