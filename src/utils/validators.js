export const isRequired = (val) => val !== null && val !== undefined && String(val).trim() !== '';
export const isPositiveNumber = (val) => !isNaN(val) && Number(val) > 0;
export const isValidDate = (val) => !!val && !isNaN(Date.parse(val));
export const isFutureDate = (val) => isValidDate(val) && new Date(val) > new Date();
export const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
export const isValidPhone = (val) => /^[+]?[\d\s\-()]{7,15}$/.test(val);
