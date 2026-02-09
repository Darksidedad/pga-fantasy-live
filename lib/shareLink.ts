const PREFIX = "r=";

export function encodeRosterToHash(text: string) {
  const encoded = encodeURIComponent(text);
  return `#${PREFIX}${encoded}`;
}

export function decodeRosterFromHash(hash: string) {
  if (!hash.startsWith(`#${PREFIX}`)) return null;
  const encoded = hash.slice(PREFIX.length + 1);
  return decodeURIComponent(encoded);
}
