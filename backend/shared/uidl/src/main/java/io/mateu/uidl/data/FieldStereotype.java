package io.mateu.uidl.data;

public enum FieldStereotype {
  regular,
  radio,
  checkbox,
  textarea,
  toggle,
  combobox,
  select,
  email,
  password,
  richText,
  listBox,
  html,
  markdown,
  image,
  icon,
  link,
  money,
  grid,
  color,
  choice,
  popover,
  slider,
  button,
  stars,
  searchable,
  /** Renders a boolean as a coloured badge/chip whose text is the field label (lit when true). */
  badge,
  /**
   * Renders the value as plain read-only text instead of an input control (see {@code @PlainText}).
   */
  plainText
}
