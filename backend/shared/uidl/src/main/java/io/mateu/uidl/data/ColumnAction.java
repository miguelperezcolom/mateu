package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record ColumnAction(String methodNameInCrud, String label, String icon, boolean disabled) {

  public ColumnAction(String methodNameInCrud, String label) {
    this(methodNameInCrud, label, "", false);
  }

  public ColumnAction(String methodNameInCrud, String label, String icon) {
    this(methodNameInCrud, label, icon, false);
  }

  public ColumnAction(String methodNameInCrud, String label, boolean disabled) {
    this(methodNameInCrud, label, "", disabled);
  }
}
