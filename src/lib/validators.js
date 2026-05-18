export const isEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value).trim());

export const isPhone = (value) => /^[+\d][\d\s()-]{7,}$/.test(String(value).trim());

export const isNotEmpty = (value) => String(value ?? '').trim().length > 0;