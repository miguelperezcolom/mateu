package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.Actionable;
import java.util.concurrent.Callable;
import lombok.Builder;

@Builder
public record Button(
    String id,
    String label,
    String iconOnLeft,
    String iconOnRight,
    String image,
    ButtonColor color,
    ButtonVariant variant,
    ButtonStyle buttonStyle,
    ButtonSize size,
    boolean autofocus,
    boolean disabled,
    String actionId,
    Actionable actionable,
    Runnable runnable,
    Callable<?> callable,
    String style,
    String cssClasses)
    implements Component, UserTrigger {

  @Override
  public ButtonColor color() {
    return color != null ? color : ButtonColor.normal;
  }

  public Button(String label, Runnable runnable) {
    this(
        null,
        label,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        camelcasize(label),
        null,
        runnable,
        null,
        null,
        null);
  }

  public Button(String label, Callable<?> callable) {
    this(
        null,
        label,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        false,
        false,
        camelcasize(label),
        null,
        null,
        callable,
        null,
        null);
  }

  private static String camelcasize(String s) {
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

  public Button(String label) {
    this(
        "",
        label,
        "",
        "",
        "",
        null,
        null,
        null,
        null,
        false,
        false,
        camelcasize(label),
        null,
        null,
        null,
        null,
        null);
  }
}
