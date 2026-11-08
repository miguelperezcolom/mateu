package io.mateu.explorer.examples.behaviour.autolayout;

import io.mateu.uidl.annotations.AutoLayout;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;

/**
 * {@code @AutoLayout} on a heavy READ-ONLY view of five or more sections: each section becomes a
 * TAB instead of a long scroll.
 */
@Title("Supplier 360")
@AutoLayout
@ReadOnly
public class SupplierOverview {

  @Section("Profile")
  @Stereotype(FieldStereotype.textarea)
  String summary = "Acme Paper Ltd., supplier since 2019. Main contact: Jane Smith.";

  @Stereotype(FieldStereotype.textarea)
  String address = "1 Mill Lane\nLeeds LS1 1AA\nUnited Kingdom";

  @Section("Billing")
  @Stereotype(FieldStereotype.textarea)
  String terms = "Net 30, bank transfer.";

  @Stereotype(FieldStereotype.textarea)
  String history = "12 invoices in 2026, all paid on time.";

  @Section("Deliveries")
  @Stereotype(FieldStereotype.textarea)
  String schedule = "Tuesdays and Thursdays, before noon.";

  @Stereotype(FieldStereotype.textarea)
  String carrier = "Own fleet; pallets only.";

  @Section("Quality")
  @Stereotype(FieldStereotype.textarea)
  String audits = "ISO 9001 audit passed in March.";

  @Stereotype(FieldStereotype.textarea)
  String incidents = "One damaged pallet in May (refunded).";

  @Section("Notes")
  @Stereotype(FieldStereotype.textarea)
  String notes = "Renewal conversation planned for September.";

  @Stereotype(FieldStereotype.textarea)
  String internal = "Prefers email over phone.";
}
