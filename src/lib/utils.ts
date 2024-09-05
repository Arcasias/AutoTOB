export const sep = (value: number) =>
  value.toFixed(2).replace(/\.(\d{2})$/, ",$1");

/**
 * This method check if the given string is a belgium valid national number.
 * The code is inspired by https://github.com/AL-dot-debug/belgium-national-identification-number-validator/blob/master/index.html
 * @param number
 */
export const nationalNumberValidator = (number: string) => {
    const nationalNumber = number.replace(/\D+/g, '');
    if (nationalNumber?.length !== 11 && !/\d{11}/.test(nationalNumber)) {
        return false;
    }

    const verificationNumber = nationalNumber.substring(9, 11);

    // Date parsing
    const date = nationalNumber.substring(0, 6);
    const year = parseInt(date.substring(0, 2), 10);
    const month = parseInt(date.substring(2, 4), 10);
    const day = parseInt(date.substring(4, 6), 10);
    const currentYear = parseInt(new Date().getFullYear().toString().substring(2, 4), 10);

    // Simple date check
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }


    let to_control_str = nationalNumber.substring(0, 9);
    // Add '2' before if date after 1st Jan 2000
    if (year < currentYear) {
        to_control_str = '2' + to_control_str.toString();
    }
    // Modulo calculation
    const to_control = parseInt(to_control_str, 10);
    const modulo = Math.floor(97 - (to_control % 97));
    const modulo_str = modulo < 10 ? '0' + modulo : '' + modulo;

    if (verificationNumber !== modulo_str) {
        throw new Error("Invalid belgium national number");
    }
}

function stripIndent(strings: TemplateStringsArray, ...values: any[]): string {
    // Combine the strings and values into a single string
    let fullString = strings.reduce((result, str, i) => result + values[i - 1] + str);

    // Find the minimum indentation level
    const match = fullString.match(/^[ \t]*(?=\S)/gm);
    if (match == null) {
        return fullString;
    }
    const indent = Math.min(...match.map(el => el.length));

    // Remove the common indentation
    const regex = new RegExp(`^[ \\t]{${indent}}`, 'gm');
    return indent > 0 ? fullString.replace(regex, '') : fullString;
}

export const getQrCodeText = (name: string, message: string, iban: string, bic: string, amount: number) => {
    if (!name) {
        throw new Error('Name of receiver must be set')
    }

    if (!message) {
        throw new Error('Message must be set')
    }
    if (message.length > 140) {
        throw new Error('Message must not be longer than 140 characters')
    }

    if (!iban) {
        throw new Error('IBAN must be set')
    }
    if (iban.length < 15 || iban.length > 34) {
        throw new Error('IBAN must be between 15 and 34 characters long')
    }

    if (amount <= 0) {
        throw new Error('Amount must be a positive number')
    }

    return stripIndent`
    BCD
    002
    1
    SCT
    ${// BIC needs to be set for some apps,
      // even though it is overwritten by the IBAN anyways.
        bic || 'AAAAAAAAAAA'
    }
    ${name}
    ${iban}
    EUR${amount}
    ${/* Unused field "purpose" */ ''}
    ${/* Unused field "reference" */ ''}
    ${message}
    ${/* Unused field "note to user" */ ''}
  `
}
