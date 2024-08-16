package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.core.interfaces.*;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.data.*;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.dtos.ResultType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Data
@Component
@Scope("prototype")
@RequiredArgsConstructor
public class ModalsForm implements HasBadges, HasStatus, HasTitle, HasSubtitle, HasCallback<String> {

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

  @Action(order = -1, target = ActionTarget.NewModal)
  public WizardPage1 openModal() throws Exception {
    return new WizardPage1();
  }

  @Action(order = 0, target = ActionTarget.NewModal, modalStyle = "width: 800px; height: 300px;")
  public TextFieldsForm openModal2() throws Exception {
    return new TextFieldsForm();
  }

  @Action(order = 10, target = ActionTarget.NewModal, modalStyle = "width: 800px; height: 300px;")
  public ChangeNameForm changeNameInModal() throws Exception {
    return new ChangeNameForm(name);
  }


  @Action(order = 20, target = ActionTarget.Left)
  public WizardPage1 openOnLeft() throws Exception {
    return new WizardPage1();
  }

  @Action(order = 30, target = ActionTarget.Right)
  public WizardPage1 openOnRight() throws Exception {
    return new WizardPage1();
  }

  @Action(order = 30, target = ActionTarget.Right, modalStyle = "width: 50vh;")
  public WizardPage1 openOnRightWide() throws Exception {
    return new WizardPage1();
  }

  @Action(order = 40, target = ActionTarget.NewTab)
  public ResponseWrapper openTab() throws Exception {
    return new ResponseWrapper("Some result", List.of(new Message(
            UUID.randomUUID().toString(),
            ResultType.Info,
            "Sample message",
            "Your name is " + name
    )));
  }

  @Action(order = 250, target = ActionTarget.NewWindow)
  public WizardPage1 openWindow() throws Exception {
    return new WizardPage1();
  }

  @Action(order = 3)
  public void assess() {
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

  @Override
  public void callback(GoBack<String> data, ServerHttpRequest serverHttpRequest) {
    name = data.getData();
  }
}
