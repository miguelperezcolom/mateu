package com.example.demo.infra.ui.menus.forms;

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
@Title("Modals")
public class ModalsForm implements HasBadges, HasStatus, HasTitle, HasSubtitle {

  @NotEmpty
  protected String name = "Mateu";

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action(order = -1, target = ActionTarget.NewModal)
  public WizardPage1 openModal() {
    return new WizardPage1();
  }

  @Action(order = 10, target = ActionTarget.NewModal, modalStyle = "width: 800px; height: 300px;")
  public TextFieldsForm openModal2() {
    return new TextFieldsForm();
  }

  @Action(order = 1, target = ActionTarget.NewModal)
  public ChangeNameInModalForm changeNameInModal() {
    return new ChangeNameInModalForm(name, this);
  }


  @Action(order = 20, target = ActionTarget.LeftDrawer)
  public WizardPage1 openOnLeft() {
    return new WizardPage1();
  }

  @Action(order = 30, target = ActionTarget.RightDrawer)
  public WizardPage1 openOnRight() {
    return new WizardPage1();
  }

  @Action(order = 30, target = ActionTarget.RightDrawer, modalStyle = "width: 50vh;")
  public WizardPage1 openOnRightWide() {
    return new WizardPage1();
  }

  @Action(order = 40, target = ActionTarget.NewTab)
  public ResponseWrapper openTab() {
    return new ResponseWrapper("Some result", List.of(new Message(
            ResultType.Info,
            "Sample message",
            "Your name is " + name,
            5000
    )));
  }

  @Action(order = 250, target = ActionTarget.NewWindow)
  public WizardPage1 openWindow() {
    return new WizardPage1();
  }

  @Action(order = 3)
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
