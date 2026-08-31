package io.mateu.core.application.openapi;

import java.util.Locale;

/** Turning contract names into legal, readable Java identifiers. */
final class JavaNames {

  private static final java.util.Set<String> RESERVED =
      java.util.Set.of(
          "abstract",
          "assert",
          "boolean",
          "break",
          "byte",
          "case",
          "catch",
          "char",
          "class",
          "const",
          "continue",
          "default",
          "do",
          "double",
          "else",
          "enum",
          "extends",
          "final",
          "finally",
          "float",
          "for",
          "goto",
          "if",
          "implements",
          "import",
          "instanceof",
          "int",
          "interface",
          "long",
          "native",
          "new",
          "package",
          "private",
          "protected",
          "public",
          "return",
          "short",
          "static",
          "strictfp",
          "super",
          "switch",
          "synchronized",
          "this",
          "throw",
          "throws",
          "transient",
          "try",
          "void",
          "volatile",
          "while",
          "record",
          "var");

  private JavaNames() {}

  /** {@code order-lines} / {@code order_lines} / {@code order lines} → {@code orderLines}. */
  static String camel(String raw) {
    var pascal = pascal(raw);
    if (pascal.isEmpty()) {
      return "value";
    }
    var camel = Character.toLowerCase(pascal.charAt(0)) + pascal.substring(1);
    return RESERVED.contains(camel) ? camel + "Value" : camel;
  }

  /** {@code order-lines} → {@code OrderLines}. */
  static String pascal(String raw) {
    if (raw == null) {
      return "";
    }
    var out = new StringBuilder();
    boolean upper = true;
    for (var c : raw.toCharArray()) {
      if (Character.isLetterOrDigit(c)) {
        out.append(upper ? Character.toUpperCase(c) : c);
        upper = false;
      } else {
        upper = true;
      }
    }
    // A name starting with a digit is not an identifier.
    if (out.length() > 0 && Character.isDigit(out.charAt(0))) {
      out.insert(0, 'N');
    }
    return out.toString();
  }

  /**
   * The group an operation belongs to, from its path: {@code /api/orders/{id}} → {@code Orders}.
   *
   * <p>A leading {@code api} or version segment is skipped — grouping every operation of a
   * conventionally-prefixed API under a class called {@code Api} would defeat the point of
   * grouping.
   */
  static String groupOf(String path) {
    if (path == null || path.isBlank()) {
      return "Root";
    }
    for (var segment : path.split("/")) {
      if (segment.isBlank() || segment.startsWith("{")) {
        continue;
      }
      var lower = segment.toLowerCase(Locale.ROOT);
      if (lower.equals("api") || lower.matches("v\\d+(\\.\\d+)*")) {
        continue;
      }
      return pascal(segment);
    }
    return "Root";
  }
}
