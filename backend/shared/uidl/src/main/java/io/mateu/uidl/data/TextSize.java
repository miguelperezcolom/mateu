package io.mateu.uidl.data;

/**
 * Font size of a {@link Text} component (and the {@code @Text} annotation). {@code m} is the
 * default and applies nothing; the other values enlarge ({@code l}, {@code xl}) or reduce ({@code
 * s}, {@code xs}) the font relative to the surrounding text.
 */
public enum TextSize {
  xl,
  l,
  m,
  s,
  xs
}
