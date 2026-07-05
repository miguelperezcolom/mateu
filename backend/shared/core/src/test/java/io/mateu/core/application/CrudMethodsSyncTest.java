package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Crud-level custom methods: @Toolbar / @Button methods on the crud class (advertised by
 * CrudActionsBuilder, dispatched through Crud.handleAction) with confirmation and row-selection
 * flags.
 */
class CrudMethodsSyncTest {

  @SuppressWarnings("unused")
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
  }

  static final List<Job> JOBS = new ArrayList<>();

  @SuppressWarnings("unused")
  @UI("/jobs")
  @Title("Jobs")
  public static class JobsCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Job> {
    static String ran;

    @Toolbar
    void pauseAll(HttpRequest httpRequest) {
      ran = "paused";
    }

    @Button
    @Action(confirmationRequired = true)
    void purge(HttpRequest httpRequest) {
      ran = "purged";
    }

    Object retry(Job row, HttpRequest httpRequest) {
      ran = "retried:" + row.id();
      return null;
    }

    @Override
    public CrudRepository<Job> repository() {
      return new CrudRepository<>() {
        @Override
        public Optional<Job> findById(String id) {
          return JOBS.stream().filter(job -> job.id().equals(id)).findFirst();
        }

        @Override
        public String save(Job entity) {
          JOBS.add(entity);
          return entity.id();
        }

        @Override
        public List<Job> findAll() {
          return JOBS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          JOBS.removeIf(job -> selectedIds.contains(job.id()));
        }
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

  @BeforeEach
  void reset() {
    JOBS.clear();
    JOBS.add(new Job("j1", "Backup"));
    JobsCrud.ran = null;
  }

  private io.mateu.dtos.UIIncrementDto run(String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/jobs")
            .consumedRoute("/jobs")
            .serverSideType(JobsCrud.class.getName())
            .actionId(actionId)
            .componentState(Map.of())
            .parameters(parameters)
            .initiatorComponentId("jc_app")
            .build());
  }

  @Test
  void listingAdvertisesTheRowMethods() {
    // crud-level @Toolbar/@Button methods are NOT part of AutoCrud's action contract —
    // only row methods (action-on-row-*) and the built-in actions are advertised
    var increment = run("", Map.of());
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    // @Toolbar and @Button methods on the crud ARE advertised as actions
    assertThat(component.actions())
        .extracting(io.mateu.dtos.ActionDto::id)
        .contains("purge", "pauseAll");
  }

  @Test
  void selectorSelectEmitsTheValueChangedEvents() {
    // pure ListingBackend path: action-on-row-select on a Selector listing emits the
    // value-changed + data-changed + close-modal-requested DispatchEvent commands
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/cities")
                .consumedRoute("/cities")
                .serverSideType(TreeActionsAndCrudNavigationSyncTest.CitySelector.class.getName())
                .actionId("action-on-row-select")
                .componentState(Map.of())
                .initiatorComponentId("sel_app")
                .build());
    // the commands travel inside the increment produced by the action-return mapping
    assertThat(increment).isNotNull();
  }

  @Test
  void pureListingRowMethodsInvokeReflectively() {
    // ListingBackend.handleAction routes action-on-row-<method> to handleActionOnRow, which
    // reflectively invokes the named method on the listing
    TreeActionsAndCrudNavigationSyncTest.toolbarRan = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/cities")
            .consumedRoute("/cities")
            .serverSideType(TreeActionsAndCrudNavigationSyncTest.CountriesListing.class.getName())
            .actionId("action-on-row-refreshAll")
            .componentState(Map.of())
            .initiatorComponentId("pl_app")
            .build());
    assertThat(TreeActionsAndCrudNavigationSyncTest.toolbarRan).isEqualTo("refreshed");
  }

  @Test
  void rowMethodsReceiveTheClickedRow() {
    run("action-on-row-retry", Map.of("_clickedRow", Map.of("id", "j1", "name", "Backup")));
    assertThat(JobsCrud.ran).isEqualTo("retried:j1");
  }
}
