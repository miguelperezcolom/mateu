package io.mateu.core.domain.fragmentmapper.reflectionbased;

import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;

public class ReflectionCommonMapper {

  public static String getTitle(Object instance) {
    if (instance instanceof HasTitle hasTitle) {
      return hasTitle.getTitle();
    }
    return null;
  }

  public static String getSubtitle(Object instance) {
    if (instance instanceof HasSubtitle hasSubtitle) {
      return hasSubtitle.getSubtitle();
    }
    return null;
  }
}
