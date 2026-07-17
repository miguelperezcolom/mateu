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
  /**
   * Renders a String field as an uploadable image: the image preview plus upload (replace) and
   * delete actions. The field value holds the image as a data URI (or URL). See {@code
   * UploadableImage}.
   */
  uploadableImage,
  /**
   * Renders a String field as a generic file upload: pick-file action + chosen file name + remove
   * action, no preview. The field value holds the file as a data URI (with the original file name
   * embedded as a {@code name=} data-URI parameter). See {@code FileUpload}.
   */
  fileUpload,
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
  plainText,
  /**
   * Renders a collection field as a plain read-only bulleted list ({@code <ul>}). See
   * {@code @BulletedList}.
   */
  bulletedList,
  /**
   * Listing filter over a temporal field as a from/to pair. The values travel in the component
   * state under {@code <fieldId>_from} / {@code <fieldId>_to} and reach the repository as a {@link
   * FilterCriterion} (between/gte/lte), never inside the entity-shaped filters object.
   */
  dateRange,
  /**
   * Listing filter over a numeric field as a min/max pair (opt-in via {@code @RangeFilter}). Same
   * wire shape as {@link #dateRange}: {@code <fieldId>_from} / {@code <fieldId>_to} state keys and
   * a {@link FilterCriterion} server-side.
   */
  numberRange,
  /**
   * A select whose dropdown is a TREE: the options carry {@code children} and selecting a node
   * stores its value (see {@code @TreeSelect}; {@code FormField.treeLeavesOnly} restricts selection
   * to leaves).
   */
  treeSelect,
  /**
   * Signature capture on a String field: a drawing canvas whose accepted strokes are stored as a
   * PNG data URI in the field value (see {@code @Signature}).
   */
  signature,
  /**
   * Photo capture on a String field: the device camera with live preview, storing the shot as a
   * JPEG data URI in the field value (see {@code @PhotoCapture}).
   */
  camera,
  /**
   * Listing filter over an enum as a multi-select (IN semantics). The state carries a list of
   * constant names (or a comma-joined string when restored from the URL) and reaches the repository
   * as a {@link FilterCriterion} with the {@code in} operator.
   */
  multiSelect
}
