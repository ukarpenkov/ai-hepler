const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidSessionId(id: string): boolean {
  return UUID_V4_REGEX.test(id);
}

export function isValidJobText(text: string): boolean {
  return typeof text === "string" && text.length >= 50;
}

export function isValidAnswer(text: string): boolean {
  return typeof text === "string" && text.length >= 10;
}
