package io.mateu.core.domain.model.outbound;

import com.google.common.base.Strings;
import org.springframework.stereotype.Service;

@Service
public class Humanizer {

  public String capitalize(String s) {
    return capitalize(s, true);
  }

  public String capitalize(String s, boolean startWithUppercase) {
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

  public String camelcasize(String s) {
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
        if (pos++ > 0 && !Strings.isNullOrEmpty(z))
          sb.append(z.substring(0, 1).toUpperCase()).append(z.substring(1));
        else sb.append(z);
      }
      c = sb.toString();
    }

    return c;
  }

  public String pluralize(String s) {
    if (s == null || "".equals(s)) return s;
    if (s.endsWith("s")) s += "es";
    else s += "s";
    if (s.endsWith("ys")) s = s.replaceAll("ys$", "ies");
    return s;
  }
}