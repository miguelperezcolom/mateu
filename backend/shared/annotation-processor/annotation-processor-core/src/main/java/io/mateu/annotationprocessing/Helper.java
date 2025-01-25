package io.mateu.annotationprocessing;

public class Helper {

  private Helper() {}

  public static String capitalize(String s) {
    return capitalize(s, true);
  }

  public static String capitalize(String s, boolean startWithUppercase) {
    if (s == null || "".equals(s)) return s;
    s = s.replace(".", " ");
    String c =
        s.replaceAll(
                String.format(
                    "%s|%s|%s",
                    "(?<=[A-Z])(?=[A-Z][a-z])",
                    "(?<=[^A-Z])(?=[A-Z])",
                    "(?<=[A-Za-z])(?=[^A-Za-z])"),
                " ")
            .toLowerCase();
    c = c.replaceAll(" +", " ");
    if (startWithUppercase && c.length() > 1) c = c.substring(0, 1).toUpperCase() + c.substring(1);

    return c;
  }
}
