package io.mateu.explorer.examples.behaviour.autolayout;

import io.mateu.uidl.annotations.AutoLayout;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import jakarta.validation.constraints.NotEmpty;

/**
 * {@code @AutoLayout} on a heavy editable form with required and optional fields: the REQUIRED
 * fields stay in view, the optional ones fold into a "More options" panel. Nothing about layout is
 * declared — only the data and which of it is required.
 */
@Title("New supplier")
@AutoLayout
public class NewSupplierForm {

  @NotEmpty String name;

  @NotEmpty String email;

  @NotEmpty String phone;

  @Stereotype(FieldStereotype.textarea)
  String deliveryNotes;

  @Stereotype(FieldStereotype.textarea)
  String billingNotes;

  @Stereotype(FieldStereotype.textarea)
  String internalNotes;

  @Stereotype(FieldStereotype.textarea)
  String certifications;

  String website;
}
