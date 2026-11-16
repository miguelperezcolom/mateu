package com.example.workshop;

import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * The model, declared once. Mateu derives the listing columns, the form fields and the validation
 * (from the bean-validation annotations) from it.
 *
 * <p>Workshop, lab 01: {@code stock} is the field you added. One line here and it is a column of
 * the listing, an input of the form and a rule the server re-checks on save.
 */
public record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    @Min(0) @Stereotype(FieldStereotype.money) double price,
    @Min(0) int stock,
    @NotNull ProductStatus status)
    implements Identifiable {

  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New product";
  }
}
