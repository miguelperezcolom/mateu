package io.mateu.core.domain.fragmentmapper.reflectionbased;

import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;

public class ReflectionCommonMapper {

  public static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier hasTitle) {
      return hasTitle.title();
    }
    return null;
  }

  public static String getSubtitle(Object instance) {
    if (instance instanceof SubtitleSupplier hasSubtitle) {
      return hasSubtitle.subtitle();
    }
    return null;
  }
}
