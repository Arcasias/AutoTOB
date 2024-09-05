const STORAGE_KEYS = ["full-name", "national-number"] as const;

export const sep = (value: number) =>
  value.toFixed(2).replace(/\.(\d{2})$/, ",$1");

export const storageGet = (
  key: (typeof STORAGE_KEYS)[number],
  defaultValue = ""
) => localStorage.getItem(key) || defaultValue;

export const storageSet = (key: (typeof STORAGE_KEYS)[number], value: any) => {
  const strValue = String(value);
  localStorage.setItem(key, strValue);
  return strValue;
};
