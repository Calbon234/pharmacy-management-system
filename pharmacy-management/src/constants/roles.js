export const ROLES = {
  ADMIN:       'admin',
  PHARMACIST:  'pharmacist',
  CASHIER:     'cashier',
  INVENTORY:   'inventory_manager',
}

export const PERMISSIONS = {
  [ROLES.ADMIN]:      ['all'],
  [ROLES.PHARMACIST]: ['prescriptions', 'inventory:read', 'patients'],
  [ROLES.CASHIER]:    ['billing', 'inventory:read'],
  [ROLES.INVENTORY]:  ['inventory'],
}
