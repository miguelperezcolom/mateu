package io.mateu.core.domain.uidefinitionlanguage.shared.interfaces;

public class Option {

  private String caption;

  private Object value;

  public Option(String caption, Object value) {
    this.caption = caption;
    this.value = value;
  }

  public Option() {}

  public String getCaption() {
    return caption;
  }

  public void setCaption(String caption) {
    this.caption = caption;
  }

  public Object getValue() {
    return value;
  }

  public void setValue(Object value) {
    this.value = value;
  }
}
