package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.core.interfaces.HasSubtitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasTitle;
import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.Badge;
import io.mateu.core.domain.uidefinition.shared.data.BadgeTheme;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.dtos.ResultType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Data
@Component
@Scope("prototype")
@RequiredArgsConstructor
@Caption("Messages")
public class MessagesForm implements HasBadges, HasStatus, HasTitle, HasSubtitle {

  @NotEmpty
  private String name = "Mateu";

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action(order = 0, target = ActionTarget.Message)
  public String messageTarget() throws Exception {
    return "Hello Mateu";
  }

  @Action(order = 1)
  public Message showMessage() throws Exception {
    return new Message(
                      ResultType.Success,
                      "Sample message",
                      "Your name is " + name,
            5000
              );
  }

  @Action(order = 2)
  public ResponseWrapper showMessageAfter() throws Exception {
    return new ResponseWrapper("Some result", List.of(new Message(
            ResultType.Info,
            "Sample message",
            "Your name is " + name,
            5000
    )));
  }

  @Action(order = 3)
  public void throwsException() throws Exception {
    throw new Exception("This is the description of teh exception ;)");
  }

  @Action(order = 4)
  public void assess() {
    assessment = "" + name;
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
