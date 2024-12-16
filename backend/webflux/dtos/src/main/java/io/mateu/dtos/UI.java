package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.*;

public record UI(
    String favIcon,
    String icon,
    String logo,
    String title,
    String subtitle,
    List<Menu> menu,
    String homeJourneyTypeId,
    String loginUrl,
    String logoutUrl,
    List<App> apps) {

  public UI {
    menu = Collections.unmodifiableList(menu);
    apps = Collections.unmodifiableList(apps);
  }

  @Override
  public List<Menu> menu() {
    return Collections.unmodifiableList(menu);
  }

  @Override
  public List<App> apps() {
    return Collections.unmodifiableList(apps);
  }
}
