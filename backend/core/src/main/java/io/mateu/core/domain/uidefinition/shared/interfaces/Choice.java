package io.mateu.core.domain.uidefinition.shared.interfaces;

import java.util.List;

public abstract class Choice {

  private Option value;

  public Option getValue() {
    return value;
  }

  public void setValue(Option value) {
    this.value = value;
  }

  public abstract List<Option> getOptions();
}
