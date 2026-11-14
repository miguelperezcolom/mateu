package com.example.workshop;

import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.HiddenInCreate;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * The model, declared once. Mateu derives the listing columns, the form fields and the validation
 * (from the bean-validation annotations) from it.
 *
 * <p>Workshop, lab 01: {@code stock} is the field you added. Lab 08: {@code addedOn} is not on the
 * creation form ({@code @HiddenInCreate}) and is never typed ({@code @ReadOnly}) — the store sets
 * it; {@code id} is typed on New and read-only afterwards ({@code @EditableOnlyWhenCreating}).
 */
public record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    @Min(0) @Stereotype(FieldStereotype.money) double price,
    @Min(0) int stock,
    @NotNull ProductStatus status,
    @HiddenInCreate @ReadOnly LocalDate addedOn)
    implements Identifiable {

  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New product";
  }
}
