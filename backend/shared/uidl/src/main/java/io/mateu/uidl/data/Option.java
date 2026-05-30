package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record Option(
    Object value, String label, String description, String image, String imageStyle, String icon) {

  public Option(Object value) {
    this(value, "" + value, "", "", "", "");
  }

  public Option(Object value, String label) {
    this(value, label, "", "", "", "");
  }

  public Option(Object value, String label, String description) {
    this(value, label, description, "", "", "");
  }

  public Option(Object value, String label, String description, String image) {
    this(value, label, description, image, "", "");
  }
}
