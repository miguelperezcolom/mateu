package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

@Builder
public record Menu(String label, RouteLink destination, List<Menu> submenu, boolean selected) {

  public Menu(String label, RouteLink destination) {
    this(label, destination, List.of(), false);
  }

  public Menu(String label, RouteLink destination, boolean selected) {
    this(label, destination, List.of(), selected);
  }
}
