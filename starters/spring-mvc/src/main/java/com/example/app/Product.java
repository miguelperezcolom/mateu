package com.example.app;

import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * The model, declared once. Mateu derives the listing columns, the form fields and the validation
 * (from the bean-validation annotations) from it. {@link Identifiable} marks the {@code id} field;
 * {@link EditableOnlyWhenCreating} lets you type it on "New" and keeps it read-only afterwards;
 * {@code @Stereotype(money)} shows the price as an amount ("89.50", in the app's locale).
 */
public record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    @Min(0) @Stereotype(FieldStereotype.money) double price,
    @NotNull ProductStatus status)
    implements Identifiable {

  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New product";
  }
}
