export const toTitleCase = (str: string) =>
    (str || '').replace(/\w[^\s/\\]*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const padLeft = (txt: string, len: number, char: string) => {
    const text = String(txt || '');
    return text.length >= len ? text : `${Array(len - text.length + 1).join(char)}${text}`;
};

export const compareBigUnsignedInt = (a: number, b?: number | string | null) => {
    let first_num = numberToString(a);
    let second_num = numberToString(b);
    if (!first_num || !second_num) {
        return '';
    }
    const max_length = Math.max(first_num.length, second_num.length);
    first_num = padLeft(first_num, max_length, '0');
    second_num = padLeft(second_num, max_length, '0');

    // lexicographical comparison
    let order = 0;
    if (first_num !== second_num) {
        order = first_num > second_num ? 1 : -1;
    }

    return order;
};

export const matchStringByChar = (s: string, p: string) => {
    if (p?.length < 1) return true;
    const z = p.split('').reduce((a, b) => `${a}[^${b}]*${b}`, '');
    return RegExp(z, 'i').test(s);
};

export const numberToString = (n?: number | string | null) => (typeof n === 'number' ? String(n) : n);
export const getKebabCase = (str?: string) => {
    if (!str || typeof str !== 'string') return str;
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
        .replace(/[\s]+/g, '-') // replace all spaces and low dash
        .toLowerCase();
};

export const capitalizeFirstLetter = (target_string: string) =>
    target_string && target_string[0].toUpperCase() + target_string.slice(1);
