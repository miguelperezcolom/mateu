// RN-08: a read-only value is TEXT, not an input box — which inputs a read-only field replaces.

const TEXT_LIKE_TYPES = ['string', 'integer', 'int', 'long', 'Integer', 'Long', 'number', 'double', 'float', 'decimal', 'BigDecimal', 'time', ''];
const TEXT_LIKE_STEREOTYPES = ['', 'regular', 'textarea', 'password', 'email', 'combobox', 'select'];

/** Whether a field renders as a plain text input — the branches a read-only value replaces. */
export function isTextLike(dataType: string, stereotype: string): boolean {
  return TEXT_LIKE_TYPES.includes(dataType) && TEXT_LIKE_STEREOTYPES.includes(stereotype);
}

/**
 * Whether a field shows its value as plain text. Step buttons do not change that: a read-only
 * number with step buttons used to render as a stepper with greyed −/+ — a record's detail page
 * (a Navigable listing's view) looked like a form with a counter the user could not press.
 */
export function showsAsReadOnlyText(editable: boolean, dataType: string, stereotype: string): boolean {
  return !editable && isTextLike(dataType, stereotype);
}
