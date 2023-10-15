package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.interfaces.MenuEntry;
import java.util.Objects;
import java.util.UUID;
import lombok.Getter;

/** Created by miguel on 8/8/16. */
@Getter
public abstract class AbstractAction implements MenuEntry {

  private String icon;
  private String style = "";
  private String caption;
  private boolean callOnEnterKeyPressed = false;
  private String id = UUID.randomUUID().toString();
  private String group = "";
  private int order = 10000;

  public AbstractAction() {

  }

  public AbstractAction(String caption) {
    this.caption = caption;
  }

  public int getOrder() {
    return order;
  }

  public AbstractAction setOrder(int order) {
    this.order = order;
    return this;
  }

  public AbstractAction setCaption(String caption) {
    this.caption = caption;
    return this;
  }

  public AbstractAction setIcon(String icon) {
    this.icon = icon;
    return this;
  }

  public void setId(String id) {
    this.id = id;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    AbstractAction that = (AbstractAction) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
