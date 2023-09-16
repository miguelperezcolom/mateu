package io.mateu.mdd.core.interfaces;

import io.mateu.util.runnable.RunnableThrowsThrowable;
import java.util.ArrayList;
import java.util.List;

public class Button {

  String caption;
  final RunnableThrowsThrowable runnable;
  String icon;
  List<String> styles = new ArrayList<>();

  public Button(String caption, RunnableThrowsThrowable runnable) {
    this(caption, null, runnable);
  }

  public Button(String caption, String icon, RunnableThrowsThrowable runnable) {
    this.caption = caption;
    this.runnable = runnable;
    this.icon = icon;
  }

  public String getCaption() {
    return caption;
  }

  public Button setCaption(String caption) {
    this.caption = caption;
    return this;
  }

  public RunnableThrowsThrowable getRunnable() {
    return runnable;
  }

  public String getIcon() {
    return icon;
  }

  public Button setIcon(String icon) {
    this.icon = icon;
    return this;
  }

  public List<String> getStyles() {
    return styles;
  }

  public Button setStyles(List<String> styles) {
    this.styles = styles;
    return this;
  }

  public Button addStyle(String style) {
    this.styles.add(style);
    return this;
  }
}
