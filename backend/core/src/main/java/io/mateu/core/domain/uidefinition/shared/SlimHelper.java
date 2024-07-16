package io.mateu.core.domain.uidefinition.shared;

import com.google.common.base.Strings;

public class SlimHelper {

  public static String capitalize(String s) {
    return capitalize(s, true);
  }

  public static String capitalize(String s, boolean startWithUppercase) {
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
    if (startWithUppercase && c.length() > 1) c = c.substring(0, 1).toUpperCase() + c.substring(1);

    return c;
  }

  public static String camelcasize(String s) {
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
      c = "";
      int pos = 0;
      for (String z : aux.split(" ")) {
        if (pos++ > 0 && !Strings.isNullOrEmpty(z))
          c += z.substring(0, 1).toUpperCase() + z.substring(1);
        else c += z;
      }
    }

    return c;
  }

  public static String pluralize(String s) {
    if (s == null || "".equals(s)) return s;
    if (s.endsWith("s")) s += "es";
    else s += "s";
    if (s.endsWith("ys")) s = s.replaceAll("ys$", "ies");
    return s;
  }
}
