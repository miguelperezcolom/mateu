package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.Map;
import lombok.Builder;

@Builder
public record Element(
    String name,
    Map<String, String> attributes,
    Map<String, String> on,
    String content,
    String style,
    String cssClasses,
    /**
     * When {@code true}, {@code content} is injected as raw HTML (via {@code innerHTML}) instead of
     * being appended as escaped text. Use for server-authored markup such as inline SVG. Only set
     * it for trusted, developer-controlled content — it bypasses text escaping.
     */
    boolean html)
    implements Component {

  /** Text content (escaped). */
  public Element(String name, Map<String, String> attributes, String content) {
    this(name, attributes, Map.of(), content, "", "", false);
  }

  /** Backward-compatible constructor: text content (escaped), no raw HTML. */
  public Element(
      String name,
      Map<String, String> attributes,
      Map<String, String> on,
      String content,
      String style,
      String cssClasses) {
    this(name, attributes, on, content, style, cssClasses, false);
  }

  /** Raw-HTML content: {@code content} is rendered as markup (e.g. an inline {@code <svg>}). */
  public static Element html(String name, Map<String, String> attributes, String content) {
    return new Element(name, attributes, Map.of(), content, "", "", true);
  }
}
