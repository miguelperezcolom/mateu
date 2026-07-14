package io.mateu.mdd.demoadminpanel.infra.in.ui.faq;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Faq;
import io.mateu.uidl.data.FaqItem;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Faq} component: a collapsible help FAQ. */
@UI("/faq-demo")
@Title("Help")
public class HelpFaq {

  @Section("Frequently asked questions")
  Component faq =
      Faq.builder()
          .items(
              List.of(
                  FaqItem.builder()
                      .question("Do I need to write any JavaScript?")
                      .answer(
                          "No. You annotate Java classes and Mateu generates the full web UI —"
                              + " forms, CRUD, navigation, charts — with zero frontend code.")
                      .open(true)
                      .build(),
                  FaqItem.builder()
                      .question("Which frameworks are supported?")
                      .answer("Spring MVC, WebFlux, Micronaut, Quarkus and Helidon MicroProfile.")
                      .build(),
                  FaqItem.builder()
                      .question("Can I use a different design system?")
                      .answer(
                          "Yes — the same model renders with Vaadin, SAP UI5, PatternFly,"
                              + " and even native React Native and an IntelliJ plugin.")
                      .build(),
                  FaqItem.builder()
                      .question("Is it open source?")
                      .answer("Yes, and published to Maven Central as io.mateu artifacts.")
                      .build()))
          .build();
}
