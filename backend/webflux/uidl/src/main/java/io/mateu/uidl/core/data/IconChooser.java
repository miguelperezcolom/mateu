package io.mateu.uidl.core.data;

import io.mateu.uidl.core.interfaces.Icon;

public class IconChooser {

  private Icon icon;

  public IconChooser() {}

  public IconChooser(Icon icon) {
    this.icon = icon;
  }

  public Icon getIcon() {
    return icon;
  }
}
