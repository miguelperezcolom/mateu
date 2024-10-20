package com.example.demo.infra.ui.menus.forms;

import com.example.demo.domain.nfl.dtos.Conference;
import com.example.demo.domain.nfl.dtos.Division;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.data.Badge;
import io.mateu.core.domain.uidefinition.shared.data.BadgeTheme;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Caption("Read only pojo")
@ReadOnly
public class MyReadOnlyPojo
    implements HasBadges, HasStatus {

  @Section("Basic")
  private String name = "Mateu";

  @Placeholder("This should appear as the placeholder")
  private String withPlaceholder;

  private int age;

  private double balance = 20.31;

  @TextArea
  private String text =
      """
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.

            Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.
            """;

  @Section("Dates")
  private LocalDate date;

  private LocalDateTime dateAndTime;

  private LocalTime time;

  @Section("Checks")
  private boolean check;

  @UseRadioButtons
  private boolean usingRadioButtons;

  @Toggle private boolean toggle;

  @Section("Enums")
  @UseRadioButtons
  private Conference conference;

  private Division division;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment =
        ""
            + name
            + ", "
            + toggle
            + ", "
            + age
            + ", "
            + balance
            + ", "
            + text
            + ", "
            + date
            + ", "
            + dateAndTime
            + ", "
            + time
            + ", "
            + check
            + ", "
            + conference
            + ", "
            + division;
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
}
