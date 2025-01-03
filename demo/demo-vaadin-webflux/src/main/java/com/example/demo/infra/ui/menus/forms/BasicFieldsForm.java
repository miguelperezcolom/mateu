package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BadgeTheme;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.HasBadges;
import io.mateu.uidl.interfaces.HasStatus;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
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
  @Help("Here the name")
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  @Email
  @Placeholder("example@acme.com")
  private String yourEmail;

  @Help("Here the age")
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
    return List.of(
            new Badge(BadgeTheme.INFO, "It works!"),
            new Badge(BadgeTheme.WARNING, "Again :)")
    );
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
