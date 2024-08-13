package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Collections;
import java.util.List;
import lombok.*;

public record Menu(
    MenuType type,
    String icon,
    String caption,
    String journeyTypeId,
    List<Menu> submenus,
    @JsonIgnore int order) {

  public Menu {
    submenus = Collections.unmodifiableList(submenus);
  }

  @Override
  public List<Menu> submenus() {
    return Collections.unmodifiableList(submenus);
  }
}
