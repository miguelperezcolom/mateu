package com.example.demo.infra.ui.menus.forms;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.core.interfaces.Icon;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ActionTarget;
import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Section;
import io.mateu.uidl.core.data.Badge;
import io.mateu.uidl.core.data.BadgeTheme;
import io.mateu.uidl.core.data.Status;
import io.mateu.uidl.core.data.StatusType;
import io.mateu.uidl.core.interfaces.HasBadges;
import io.mateu.uidl.core.interfaces.HasStatus;
import lombok.Data;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Caption("Read only pojo with crud")
@Component
@Scope("prototype")
@ReadOnly
public class MyReadOnlyPojoWithCrudForm
    implements HasBadges, HasStatus {

  @JsonIgnore
  private final MyReadOnlyPojoData data;
  @JsonIgnore
  private final MyReadOnlyPojoWithCrudEditor editor;

  @Section(value = "", columns = 2)
  private String name = "Mateu";

  private int age;

  private String assessment;

  @Action
  public void assess() {
    assessment = "" + name + ", " + age;
  }

  public String toString() {
    return "This is a sample form (from toString)";
  }

  @Override
  public List<Badge> getBadges() {
    return List.of(new Badge(BadgeTheme.WARNING, "It works!"));
  }

  public Object retrieveId() {
    return "010100101";
  }

  @Override
  public Status getStatus() {
    return new Status(StatusType.SUCCESS, "This is the status!");
  }

  @Action(icon = Icon.Refresh, target = ActionTarget.Component, order = -1)
  @Caption("")
  public void refresh() {
    assessment = "reloaded";
  }

  @Action("Edit")
  public Object retrieveEditor() {
    editor.setId(retrieveId().toString());
    return editor;
  }

}
