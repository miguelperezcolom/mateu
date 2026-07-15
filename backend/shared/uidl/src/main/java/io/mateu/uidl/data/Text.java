package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder
public record Text(
    String id,
    String text,
    TextContainer container,
    List<TextVariant> variants,
    TextSize size,
    boolean noMargins,
    String style,
    String cssClasses,
    Map<String, String> attributes)
    implements Component {

  public Text(String id, String text) {
    this(id, text, TextContainer.div, List.of(), null, false, "", "", Map.of());
  }

  public Text(String id, String text, List<TextVariant> variants) {
    this(id, text, TextContainer.div, variants, null, false, "", "", Map.of());
  }

  public Text(String id, String text, TextContainer container) {
    this(id, text, container, List.of(), null, false, "", "", Map.of());
  }

  public Text(String text) {
    this(null, text, TextContainer.div, List.of(), null, false, "", "", Map.of());
  }

  public Text(String text, List<TextVariant> variants) {
    this(null, text, TextContainer.div, variants, null, false, "", "", Map.of());
  }

  public Text(String text, TextContainer container) {
    this(null, text, container, List.of(), null, false, "", "", Map.of());
  }

  @Override
  public TextContainer container() {
    return container != null ? container : TextContainer.div;
  }
}
