package com.example.demo.infra.ui.menus.forms;

import com.example.demo.domain.programmingLanguages.ProgrammingLanguages;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import io.mateu.remote.dtos.ResultType;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Caption("Read only pojo with crud")
@Component
public class MyReadOnlyPojoWithCrud
    implements io.mateu.mdd.core.interfaces.ReadOnlyPojo, HasBadges, HasStatus {

  @Getter@Setter
  public class MyEditor {

    String id;
    String name;

    public MyEditor(String id, String name) {
      this.id = id;
      this.name = name;
    }

    public MyEditor() {
    }

    @Action(value = "Save")
    public GoBack save() {
      System.out.println("saved");
      return new GoBack(ResultType.Success, "Saved");
    }

  }

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

  @Override
  public void load(Object id) throws Throwable {}

  @Override
  public Object retrieveId() {
    return "010100101";
  }

  @Override
  public Status getStatus() {
    return new Status(StatusType.SUCCESS, "This is the status!");
  }

  @Override
  public boolean hasEditor() {
    return true;
  }

  @Override
  public Object retrieveEditor() throws Throwable {
    return new MyEditor(retrieveId().toString(), name);
  }
}
