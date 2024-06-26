package com.example.demoremote.ui.demoApp.menus.forms;

import com.example.demoremote.domains.programmingLanguages.ProgrammingLanguages;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Badge;
import io.mateu.mdd.shared.data.BadgeTheme;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import io.mateu.mdd.shared.interfaces.HasBadges;
import io.mateu.mdd.shared.interfaces.HasStatus;
import java.util.List;
import lombok.Data;

@Data
@Caption("ead only pojo with crud")
public class MyReadOnlyPojoWithCrud
    implements io.mateu.mdd.core.interfaces.ReadOnlyPojo, HasBadges, HasStatus {

  @Section("Basic")
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  private int age;

  private double balance = 20.31;

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
}
