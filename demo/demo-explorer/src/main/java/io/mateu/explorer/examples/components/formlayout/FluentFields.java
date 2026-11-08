package io.mateu.explorer.examples.components.formlayout;

import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.FormSubSection;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The same tree as the YAML, built fluently: FormSection → FormLayout → FormFields, a
 * FormSubSection inside, and a CustomField holding a Notice. Each FormField is bound to the
 * component state by its id.
 */
public class FluentFields implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return FormSection.builder()
        .title("Guest")
        .content(
            List.of(
                FormLayout.builder()
                    .maxColumns(3)
                    .content(
                        List.of(
                            FormField.builder().id("firstName").label("First name").required(true).build(),
                            FormField.builder().id("lastName").label("Last name").required(true).build(),
                            FormField.builder().id("birthDate").label("Date of birth").dataType(FieldDataType.date).build(),
                            FormField.builder()
                                .id("vip")
                                .label("VIP guest")
                                .dataType(FieldDataType.bool)
                                .stereotype(FieldStereotype.toggle)
                                .build()))
                    .build(),
                FormSubSection.builder()
                    .title("Stay preferences")
                    .content(
                        List.of(
                            FormLayout.builder()
                                .maxColumns(2)
                                .content(
                                    List.of(
                                        FormField.builder()
                                            .id("roomType")
                                            .label("Room type")
                                            .stereotype(FieldStereotype.select)
                                            .options(
                                                List.of(
                                                    new Option("standard", "Standard"),
                                                    new Option("deluxe", "Deluxe sea view"),
                                                    new Option("suite", "Junior suite")))
                                            .build(),
                                        CustomField.builder()
                                            .label("Cancellation policy")
                                            .content(
                                                Notice.builder()
                                                    .theme("info")
                                                    .text("Free cancellation until 48 h before arrival.")
                                                    .build())
                                            .build()))
                                .build()))
                    .build()))
        .build();
  }
}
