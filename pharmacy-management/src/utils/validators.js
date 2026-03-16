/** Form field validators */
export const isRequired  = (v) => (v ? null : 'This field is required')
export const isEmail     = (v) => (/\S+@\S+\.\S+/.test(v) ? null : 'Invalid email address')
export const isPositive  = (v) => (Number(v) > 0 ? null : 'Must be a positive number')
export const minLength   = (n) => (v) => (v?.length >= n ? null : `Minimum ${n} characters`)
