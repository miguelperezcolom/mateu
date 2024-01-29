package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Badge;
import io.mateu.mdd.shared.data.BadgeTheme;
import io.mateu.mdd.shared.interfaces.HasBadges;
import java.net.URL;
import java.util.List;
import lombok.Data;

@Data
public class MiscellaneousForm implements HasBadges {

  @Section("Links")
  private URL url;

  @Link private String linkAsString;

  @Html private String htmlWithLinks;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + url;
  }

  public String toString() {
    return "This is a sample form";
  }

  @Override
  public List<Badge> getBadges() {
    return List.of(new Badge(BadgeTheme.WARNING, "It works!"));
  }
}
