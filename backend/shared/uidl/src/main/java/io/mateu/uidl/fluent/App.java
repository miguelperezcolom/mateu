package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import lombok.Builder;

@Builder
public record App(
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    List<Actionable> menu,
    AppVariant variant)
    implements Component {

  public App {
    variant = variant != null ? variant : AppVariant.TABS;
    menu = menu != null ? menu : List.of();
  }
}
