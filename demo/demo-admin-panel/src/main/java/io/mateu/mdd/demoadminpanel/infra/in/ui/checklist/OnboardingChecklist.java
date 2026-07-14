package io.mateu.mdd.demoadminpanel.infra.in.ui.checklist;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Checklist;
import io.mateu.uidl.data.ChecklistItem;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Checklist} component: an onboarding checklist with progress. */
@UI("/checklist-demo")
@Title("Get started")
public class OnboardingChecklist {

  @Section("Onboarding")
  Component checklist =
      Checklist.builder()
          .title("Set up your workspace")
          .items(
              List.of(
                  ChecklistItem.builder().label("Create your account").done(true).build(),
                  ChecklistItem.builder().label("Verify your email").done(true).build(),
                  ChecklistItem.builder().label("Invite your team").actionId("toggle").build(),
                  ChecklistItem.builder().label("Connect a data source").actionId("toggle").build(),
                  ChecklistItem.builder().label("Publish your first screen").actionId("toggle").build()))
          .build();
}
