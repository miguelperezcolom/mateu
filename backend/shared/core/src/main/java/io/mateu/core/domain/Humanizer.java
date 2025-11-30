package io.mateu.core.domain;

import jakarta.inject.Named;

@Named
public class Humanizer {

  public static String toKebabCase(String s) {
    return toSnakeCase(s).replace("_", "-");
  }

  public static String toSnakeCase(String s) {
    var result = new StringBuilder();
    var source = toCamelCase(s);
    for (var i = 0; i < source.length(); i++) {
      var c = source.charAt(i);
      if (Character.isUpperCase(c)) {
        result.append('_');
        result.append(Character.toLowerCase(c));
      } else {
        result.append(c);
      }
    }
    return result.toString();
  }

  public static String toUpperCaseFirst(String s) {
    return toUpperCaseFirst(s, true);
  }

  public static String toUpperCaseFirst(String s, boolean startWithUppercase) {
    if (s == null || "".equals(s)) return s;
    s = s.replaceAll("\\.", " ").replaceAll("_", " ").replaceAll("-", " ");
    String c =
        s.replaceAll(
                String.format(
                    "%s|%s|%s",
                    "(?<=[A-Z])(?=[A-Z][a-z])",
                    "(?<=[^A-Z])(?=[A-Z])",
                    "(?<=[A-Za-z])(?=[^A-Za-z])"),
                " ")
            .toLowerCase();
    c = c.replaceAll("[ ]+", " ");
    if (startWithUppercase && c.length() > 1) c = c.substring(0, 1).toUpperCase() + c.substring(1);

    return c;
  }

  public static String toCamelCase(String s) {
    if (s == null || "".equals(s)) return s;
    s = s.replaceAll("\\.", " ");
    String c =
        s.replaceAll(
                String.format(
                    "%s|%s|%s",
                    "(?<=[A-Z])(?=[A-Z][a-z])",
                    "(?<=[^A-Z])(?=[A-Z])",
                    "(?<=[A-Za-z])(?=[^A-Za-z])"),
                " ")
            .toLowerCase();
    c = c.replaceAll("[ ]+", " ");
    if (c.length() > 1) {
      String aux = c;
      var sb = new StringBuilder();
      int pos = 0;
      for (String z : aux.split(" ")) {
        if (pos++ > 0 && !isEmpty(z))
          sb.append(z.substring(0, 1).toUpperCase()).append(z.substring(1));
        else sb.append(z);
      }
      c = sb.toString();
    }

    return c;
  }

  private static boolean isEmpty(String z) {
    return z.trim().isEmpty();
  }

  public static String toPlural(String s) {
    if (s == null || "".equals(s)) return s;
    if (s.endsWith("s")) s += "es";
    else s += "s";
    if (s.endsWith("ys")) s = s.replaceAll("ys$", "ies");
    return s;
  }
}
