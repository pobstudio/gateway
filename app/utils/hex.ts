export function shortenHexString(str: string, chars = 4): string {
  return `${str.substring(0, chars + 2)}...${str.substring(
    str.length - chars,
  )}`;
}

export function padHexString(str: string, length = 64): string {
  return `0x${str.slice(2).padStart(length, '0')}`;
}
