export function encodeRosterToHash(roster: any) {
  const json = JSON.stringify(roster);
  return "#" + btoa(json);
}

export function decodeRosterFromHash(hash: string) {
  try {
    const json = atob(hash.replace("#", ""));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
