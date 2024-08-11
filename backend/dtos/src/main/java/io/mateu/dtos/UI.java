package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.*;

public record UI(
    String favIcon,
    String logo,
    String title,
    String subtitle,
    List<Menu> menu,
    String homeJourneyTypeId,
    String loginUrl,
    String logoutUrl) {

  public UI {
    menu = Collections.unmodifiableList(menu);
  }

  @Override
  public List<Menu> menu() {
    return Collections.unmodifiableList(menu);
  }
}
