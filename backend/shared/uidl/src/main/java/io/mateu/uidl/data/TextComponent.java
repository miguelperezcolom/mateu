package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;

public record TextComponent(String text, TextContainer container, List<TextVariant> variants)
    implements Component {

  public TextComponent(String text) {
    this(text, TextContainer.p, List.of());
  }

  public TextComponent(String text, List<TextVariant> variants) {
    this(text, TextContainer.p, variants);
  }

  public TextComponent(String text, TextContainer container) {
    this(text, container, List.of());
  }
}
