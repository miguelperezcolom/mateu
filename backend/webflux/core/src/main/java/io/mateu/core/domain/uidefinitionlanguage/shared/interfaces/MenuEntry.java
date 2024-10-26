package io.mateu.core.domain.uidefinitionlanguage.shared.interfaces;

/** Created by miguel on 9/8/16. */
public interface MenuEntry {

  String getIcon();

  String getCaption();

  String getId();

  void setId(String id);

  int getOrder();

  MenuEntry setOrder(int order);

  MenuEntry setCaption(String caption);

  MenuEntry setIcon(String icon);
}
