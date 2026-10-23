package io.mateu.mdd.redwoodshowcase.ui.createedit;

import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toc;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;

/**
 * Redwood «Advanced create and edit», variant A: a long form with a section index (@Toc). The
 * example of doc/…/ux-patterns/advanced-create-and-edit.md, served with the Redwood renderer.
 */
@UI("/advanced-create-edit-demo")
@Title("Edit employee")
@Toc
public class EmployeeEdit {

  @KPI @Label("Department") String department = "Engineering";

  @KPI @Label("Status") String status = "Active";

  @BadgeInHeader(label = "Active", color = "success")
  boolean active = true;

  @Timestamp("Last updated")
  String updatedAt = "2026-07-26 09:12";

  @Section("Identity") @NotEmpty String name = "Ada Lovelace";

  @Section("Identity") String email = "ada@example.com";

  @Section(value = "Employment", editAction = "editEmployment")
  String title = "Principal engineer";

  @Section(value = "Employment", editAction = "editEmployment")
  LocalDate hiredOn = LocalDate.of(2021, 3, 1);

  @Section("Compensation")
  @Stereotype(FieldStereotype.money)
  BigDecimal salary = new BigDecimal("98000");

  @Section("Notes")
  @Stereotype(FieldStereotype.textarea)
  String notes = "Leads the platform team.";

  @Toolbar
  public URI cancel() {
    return URI.create("/");
  }

  @Toolbar
  public Message save() {
    return new Message("Saved");
  }

  public Message editEmployment() {
    return new Message("Employment history opens here");
  }
}
