package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.core.interfaces.HasSubtitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasTitle;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.Badge;
import io.mateu.core.domain.uidefinition.shared.data.BadgeTheme;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;

@Data
public class BasicFieldsForm implements HasBadges, HasStatus, HasTitle, HasSubtitle {

  @Section(value = "Basic", columns = 2)
  @NotEmpty
  @RequestFocus
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  @Email
  @Placeholder("example@acme.com")
  private String yourEmail;

  @NotNull private int age = 15;

  private double balance = 20.31;

  @Section(value = "Assessment", columns = 1)
  @ReadOnly
  private String assessment;

  @Action(order = 0)
  public void throwsException() throws Exception {
    throw new Exception("This is the description of teh exception ;)");
  }

  @Action(order = 1)
  public void slowAction() throws InterruptedException {
    Thread.sleep(5000);
    assessment = "run";
  }

  @Action(order = 2)
  public void assess(ServerHttpRequest serverHttpRequest) {
    assessment = "" + name + ", " + age + ", " + balance + ", " + withPlaceholder;
  }

  public String toString() {
    return "This is a sample form (toString)";
  }

  @Override
  public List<Badge> getBadges() {
    return List.of(new Badge(BadgeTheme.WARNING, "It works!"));
  }

  @Override
  public Status getStatus() {
    return new Status(StatusType.SUCCESS, "This is the status!");
  }

  @Override
  public String getSubtitle() {
    return "This is the subtitle";
  }

  @Override
  public String getTitle() {
    return "This is the title";
  }
}
