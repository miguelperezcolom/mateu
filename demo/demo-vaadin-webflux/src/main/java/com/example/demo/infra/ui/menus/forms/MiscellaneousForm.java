package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.RawContent;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Section;
import io.mateu.uidl.core.data.Badge;
import io.mateu.uidl.core.data.BadgeTheme;
import io.mateu.uidl.core.interfaces.HasBadges;
import lombok.Data;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

@Data
public class MiscellaneousForm implements HasBadges {

  @Section("Links")
  private URL url;

  @RawContent
  private String htmlWithLinks;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  public MiscellaneousForm() throws MalformedURLException {
    url  = new URL("https://www.google.es");
    htmlWithLinks = "Esto es un <a href='https://www.google.es'>link</a>";
  }

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
