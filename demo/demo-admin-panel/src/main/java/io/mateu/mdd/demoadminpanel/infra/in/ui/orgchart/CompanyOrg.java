package io.mateu.mdd.demoadminpanel.infra.in.ui.orgchart;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.OrgChart;
import io.mateu.uidl.data.OrgNode;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link OrgChart} component: a company org chart. */
@UI("/orgchart-demo")
@Title("Org chart")
public class CompanyOrg {

  @Section("Leadership")
  Component org =
      OrgChart.builder()
          .root(
              OrgNode.builder()
                  .title("Ada Lovelace")
                  .subtitle("CEO")
                  .avatar("👑")
                  .color("#1a73e8")
                  .actionId("openPerson")
                  .children(
                      List.of(
                          OrgNode.builder()
                              .title("Alan Turing")
                              .subtitle("CTO")
                              .avatar("💻")
                              .color("#8b5cf6")
                              .children(
                                  List.of(
                                      OrgNode.builder().title("Grace Hopper").subtitle("VP Eng").avatar("🛠").build(),
                                      OrgNode.builder().title("Linus T.").subtitle("VP Infra").avatar("🐧").build()))
                              .build(),
                          OrgNode.builder()
                              .title("Katherine J.")
                              .subtitle("CFO")
                              .avatar("📊")
                              .color("#10b981")
                              .children(
                                  List.of(
                                      OrgNode.builder().title("Margaret H.").subtitle("Controller").avatar("📈").build()))
                              .build(),
                          OrgNode.builder()
                              .title("Radia P.")
                              .subtitle("CMO")
                              .avatar("📣")
                              .color("#f59e0b")
                              .build()))
                  .build())
          .build();
}
