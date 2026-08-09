package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The detail view of a crud builds its toolbar with {@code ViewToolbarBuilder}, a different path
 * from the page-level {@code PageButtonsBuilder}. It used to label every button by humanizing the
 * method name, silently dropping {@code @Label} — so an action declared as "Retry from failure"
 * appeared as "Retry process" and read to operators as a missing button.
 */
class ViewToolbarLabelSyncTest {

  public static class Job implements Identifiable {
    String id;
    String name;

    public Job() {}

    public Job(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }

    @Toolbar
    @Label("Retry from failure")
    public void retryProcess() {}

    /** No {@code @Label}: still humanized from the method name. */
    @Toolbar
    public void pauseProcess() {}
  }

  static final List<Job> JOBS = new ArrayList<>(List.of(new Job("1", "Nightly import")));

  @UI("/jobs")
  @Title("Jobs")
  @ReadOnly
  public static class JobsCrud extends AutoCrud<Job> {

    @ViewToolbarButton
    @Label("Export to Excel")
    public void exportRows() {}

    @Override
    public CrudStore<Job> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Job> findById(String id) {
          return JOBS.stream().filter(job -> job.id().equals(id)).findFirst();
        }

        @Override
        public String save(Job entity) {
          return entity.id();
        }

        @Override
        public List<Job> findAll() {
          return JOBS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(JobsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private List<ButtonDto> viewToolbar() {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/jobs/1")
                .consumedRoute("/jobs")
                .serverSideType(JobsCrud.class.getName())
                .actionId("")
                .initiatorComponentId("c1_app")
                .componentState(Map.of())
                .build());
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    var buttons = new ArrayList<ButtonDto>();
    collectButtons(component, buttons);
    return buttons;
  }

  private static void collectButtons(Object node, List<ButtonDto> out) {
    if (node instanceof ButtonDto button) {
      out.add(button);
      return;
    }
    if (node instanceof io.mateu.dtos.ComponentDto component) {
      if (component instanceof io.mateu.dtos.ClientSideComponentDto clientSide) {
        collectButtons(clientSide.metadata(), out);
      }
      if (component instanceof ServerSideComponentDto serverSide) {
        serverSide.children().forEach(child -> collectButtons(child, out));
      }
    }
    if (node instanceof io.mateu.dtos.PageDto page) {
      page.toolbar().forEach(trigger -> collectButtons(trigger, out));
    }
    if (node instanceof io.mateu.dtos.ClientSideComponentDto clientSide) {
      clientSide.children().forEach(child -> collectButtons(child, out));
    }
  }

  @Test
  void toolbarButtonsOnTheViewedEntityUseTheirDeclaredLabel() {
    assertThat(viewToolbar())
        .extracting(ButtonDto::label)
        .contains("Retry from failure")
        .doesNotContain("Retry process");
  }

  @Test
  void aToolbarMethodWithoutALabelIsStillHumanizedFromItsName() {
    assertThat(viewToolbar()).extracting(ButtonDto::label).contains("Pause process");
  }

  @Test
  void viewToolbarButtonsOnTheCrudAlsoUseTheirDeclaredLabel() {
    assertThat(viewToolbar())
        .extracting(ButtonDto::label)
        .contains("Export to Excel")
        .doesNotContain("Export rows");
  }
}
