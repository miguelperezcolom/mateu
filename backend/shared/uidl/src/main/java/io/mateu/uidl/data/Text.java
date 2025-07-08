package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record Text(
    String text,
    TextContainer container,
    List<TextVariant> variants,
    String style,
    String cssClasses)
    implements Component {

  public Text(String text) {
    this(text, TextContainer.p, List.of(), "", "");
  }

  public Text(String text, List<TextVariant> variants) {
    this(text, TextContainer.p, variants, "", "");
  }

  public Text(String text, TextContainer container) {
    this(text, container, List.of(), "", "");
  }

  @Override
  public TextContainer container() {
    return container != null ? container : TextContainer.p;
  }
}
