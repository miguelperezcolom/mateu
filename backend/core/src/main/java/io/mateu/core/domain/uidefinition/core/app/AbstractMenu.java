package io.mateu.core.domain.uidefinition.core.app;

import io.mateu.core.domain.uidefinition.shared.interfaces.MenuEntry;
import java.util.List;
import java.util.UUID;

/** Created by miguel on 9/8/16. */
public abstract class AbstractMenu implements MenuEntry {

  private String id = UUID.randomUUID().toString();

  private String icon;
  private String name;
  private List<MenuEntry> entries;
  private int order = 10000;

  public AbstractMenu(String name) {
    this.name = name;
  }

  public AbstractMenu(String icon, String name) {
    this.icon = icon;
    this.name = name;
  }

  public String getCaption() {
    return name;
  }

  public List<MenuEntry> getEntries() {
    if (entries == null)
      synchronized (this) {
        entries = buildEntries();
      }
    return entries;
  }

  public abstract List<MenuEntry> buildEntries();

  @Override
  public int hashCode() {
    return id.hashCode();
  }

  public String getId() {
    return id;
  }

  @Override
  public void setId(String id) {
    this.id = id;
  }

  @Override
  public String getIcon() {
    return icon;
  }

  @Override
  public int getOrder() {
    return order;
  }

  public AbstractMenu setOrder(int order) {
    this.order = order;
    return this;
  }
}
