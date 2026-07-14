package io.mateu.mdd.demoadminpanel.infra.in.ui.features;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Feature;
import io.mateu.uidl.data.FeatureGrid;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link FeatureGrid} component: a product feature grid. */
@UI("/features-demo")
@Title("Why Mateu")
public class ProductFeatures {

  @Section("Features")
  Component features =
      FeatureGrid.builder()
          .columns(3)
          .features(
              List.of(
                  Feature.builder()
                      .icon("⚡")
                      .title("Zero frontend")
                      .description("Annotate Java, get a full web UI. No JS to write.")
                      .build(),
                  Feature.builder()
                      .icon("🧩")
                      .title("Full-stack components")
                      .description("Dashboards, kanban, calendars, charts — declarative.")
                      .build(),
                  Feature.builder()
                      .icon("🎨")
                      .title("Multi-renderer")
                      .description("Vaadin, SAP UI5, PatternFly, React Native — same model.")
                      .build(),
                  Feature.builder()
                      .icon("🔒")
                      .title("Validation built in")
                      .description("Bean-validation drives client + server checks.")
                      .build(),
                  Feature.builder()
                      .icon("🌗")
                      .title("Dark mode")
                      .description("Every component is theme-aware out of the box.")
                      .build(),
                  Feature.builder()
                      .icon("🤖")
                      .title("AI chat")
                      .description("Drop-in assistant that can operate your app.")
                      .actionId("openAi")
                      .build()))
          .build();
}
