// @ts-expect-error as the generic is a Array
export const flatten = <T extends Array<unknown>>(arr: T) => [].concat(...arr);
