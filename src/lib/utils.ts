const STORAGE_KEYS = ["full-name", "national-number", "theme"] as const;

export const sep = (value: number) =>
  value.toFixed(2).replace(/\.(\d{2})$/, ",$1");

export const storageGet = <T = string>(
  key: (typeof STORAGE_KEYS)[number],
  defaultValue = ""
) => (localStorage.getItem(key) || storageSet(key, defaultValue)) as T;

export const storageSet = (key: (typeof STORAGE_KEYS)[number], value: any) => {
  const strValue = String(value);
  localStorage.setItem(key, strValue);
  return strValue;
};
