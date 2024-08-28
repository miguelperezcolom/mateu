package com.example.demo.infra.ui.menus.forms;

import com.example.demo.domain.programmingLanguages.ProgrammingLanguages;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.shared.data.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.Placeholder;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Caption("Read only pojo with crud")
@Component
@Scope("prototype")
@ReadOnly
public class MyReadOnlyPojoWithCrud
    implements HasBadges, HasStatus {

  @JsonIgnore
  private final MyReadOnlyPojoData data;
  @JsonIgnore
  private final MyReadOnlyPojoWithCrudEditor editor;

  @Section("Basic")
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  private int age;

  private double balance = 20.31;

  @Autowired
  private ProgrammingLanguages programmingLanguages;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + name + ", " + age + ", " + balance;
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

  @Action("Edit")
  public Object retrieveEditor() throws Throwable {
    editor.setId(retrieveId().toString());
    return editor;
  }

}
