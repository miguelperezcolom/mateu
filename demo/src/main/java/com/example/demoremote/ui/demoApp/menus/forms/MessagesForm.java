package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.core.interfaces.HasMessages;
import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.core.interfaces.Message;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Badge;
import io.mateu.mdd.shared.data.BadgeType;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import io.mateu.mdd.shared.interfaces.MateuSecurityManager;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.remote.dtos.ResultType;
import io.mateu.util.Helper;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class MessagesForm implements HasBadges, HasStatus, HasTitle, HasSubtitle, HasMessages {

  @Override
  public List<Message> getMessages() {
    return List.of(new Message(
            UUID.randomUUID().toString(),
            ResultType.Success,
            "This is the title",
            "This is the text of the message ;)"
    ), new Message(
            UUID.randomUUID().toString(),
            ResultType.Info,
            null,
            "This is the text of the message ;)"
    ), new Message(
            UUID.randomUUID().toString(),
            ResultType.Warning,
            null,
            "This is the text of the message ;)"
    ), new Message(
            UUID.randomUUID().toString(),
            ResultType.Error,
            null,
            "This is the text of the message ;)"
    ));
  }

  @Tab("Tab 1")
  @Section("Basic")
  @NotEmpty
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  @Tab("Tab 2")
  @NotNull private int age = 15;

  private double balance = 20.31;

  @Section("Assessment")
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
  public void assess() {
    assessment = "" + getCurrentUser() + "" + name + ", " + age + ", " + balance + ", " + withPlaceholder;
  }

  private String getCurrentUser() {
    try {
      UserPrincipal principal = Helper.getImpl(MateuSecurityManager.class).getPrincipal();
      if (principal == null) {
        return "principal es null";
      }
      return principal.getName();
    } catch (Exception e) {
      return "" + e.getClass().getSimpleName() + ": " + e.getMessage();
    }
  }

  public String toString() {
    return "This is a sample form (toString)";
  }

  @Override
  public List<Badge> getBadges() {
    return List.of(new Badge(BadgeType.WARNING, "It works!"));
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