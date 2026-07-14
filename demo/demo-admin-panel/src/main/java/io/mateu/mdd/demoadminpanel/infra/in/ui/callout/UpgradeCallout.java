package io.mateu.mdd.demoadminpanel.infra.in.ui.callout;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CalloutCard;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link CalloutCard} component: themed call-to-action blocks. */
@UI("/callout-demo")
@Title("Callouts")
public class UpgradeCallout {

  @Section("Callouts")
  Component callouts =
      VerticalLayout.builder()
          .style("gap: 1rem;")
          .content(
              List.of(
                  CalloutCard.builder()
                      .theme("info")
                      .icon("💡")
                      .title("New: full-stack components")
                      .description("Dashboards, kanban, calendars and charts — all declarative.")
                      .ctaLabel("See what's new")
                      .actionId("openChangelog")
                      .build(),
                  CalloutCard.builder()
                      .theme("success")
                      .icon("🎉")
                      .title("Your workspace is ready")
                      .description("Everything is set up. Jump in and create your first screen.")
                      .ctaLabel("Open workspace")
                      .actionId("openWorkspace")
                      .build(),
                  CalloutCard.builder()
                      .theme("warning")
                      .icon("⚠️")
                      .title("Trial ends in 3 days")
                      .description("Upgrade now to keep your projects and data.")
                      .ctaLabel("Upgrade")
                      .actionId("upgrade")
                      .build(),
                  CalloutCard.builder()
                      .theme("danger")
                      .icon("🔴")
                      .title("Payment failed")
                      .description("We couldn't charge your card. Update it to avoid interruption.")
                      .ctaLabel("Update payment")
                      .actionId("updatePayment")
                      .build()))
          .build();
}
