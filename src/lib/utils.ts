import { toCanvas } from "qrcode";
import colors from "tailwindcss/colors";

const STORAGE_KEYS = ["full-name", "national-number", "theme"] as const;

const R_NATIONAL_NUMBER = /^\d{11}$/;

export const renderQrCode = (canvas: HTMLCanvasElement, total: number, reference: string) => {
  const text = [
    "BCD", // Service Tag
    "001", // Version
    "1", // Character set
    "SCT", // Identification
    BANK_INFO.bic, // BIC
    BANK_INFO.name, // Name
    BANK_INFO.iban, // IBAN
    `EUR${sep(total || 0)}`, // Amount
    "", // Reason
    "", // Ref of invoice
    reference, // Or text
  ].join("\n");

  const qrColors = [colors.slate[950], colors.slate[50]];
  if (storageGet("theme") === "dark") {
    qrColors.reverse();
  }
  toCanvas(canvas, text, {
    width: 200,
    color: { dark: qrColors[0], light: qrColors[1] },
  });
};

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

export const validateNationalNumber = () => {
  const number = storageGet("national-number");
  if (number && !R_NATIONAL_NUMBER.test(number)) {
    return new Error("National number must be an 11-digit number");
  }
};

export const BANK_INFO = {
  bic: "PCHQBEBB",
  iban: "BE39679200229319",
  name: "Centre de perception - section taxes diverses",
};
