package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.Message;
import io.mateu.uidl.interfaces.ResponseWrapper;
import io.mateu.uidl.interfaces.HasBadges;
import io.mateu.uidl.interfaces.HasStatus;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@Scope("prototype")
@RequiredArgsConstructor
@Title("Messages")
public class MessagesForm implements HasBadges, HasStatus, HasTitle, HasSubtitle {

  @NotEmpty
  private String name = "Mateu";

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action(order = 0, target = ActionTarget.Message)
  public String messageTarget() {
    return "Hello Mateu";
  }

  @Action(order = 1)
  public Message showMessage() {
    return new Message(
                      ResultType.Success,
                      "Sample message",
                      "Your name is " + name,
            5000
              );
  }

  @Action(order = 2)
  public ResponseWrapper showMessageAfter() {
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
