package io.mateu.core.perf;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Translator;
import jakarta.inject.Inject;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The request budget: how much container and reflection work ONE warm request costs, on five
 * reference screens (a simple form, a CRUD's listing, a CRUD search, an app shell and a wizard
 * step).
 *
 * <p>The counts are deterministic, so they gate instead of timing: each scenario runs once to warm
 * up (class-level caches fill, singleton registries resolve), the counters reset, and the SAME
 * request runs again. What that second request asks the container ({@code getBean}/{@code getBeans}
 * through the adapter's provider — Spring's {@code getBeansOfType}, CDI's {@code BeanManager}) and
 * how many classes it walks reflectively looking for injection points is pinned exactly. A new
 * lookup on the request path fails here; so does a cache that stopped caching.
 *
 * <p>The lookups that remain are the ones that must stay lookups: a view model class asked for as a
 * bean before Mateu instantiates it (it may be a prototype bean, by the documented DI pattern), and
 * an {@code @Inject} field filled with the container's bean of its type (the app decides its
 * scope).
 */
class RequestBudgetTest {

  // ── fixtures ──────────────────────────────────────────────────────────────

  @UI("/perf/form")
  @Title("Simple form")
  public static class SimpleForm {
    @Inject Translator translator;
    String name = "Ana";
    int age = 30;
    boolean active = true;
    String notes;
  }

  public static class Item implements Identifiable {
    String id;
    String name;
    int units;

    public Item() {}

    Item(String id, String name, int units) {
      this.id = id;
      this.name = name;
      this.units = units;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return id + " " + name;
    }
  }

  static final List<Item> ITEMS =
      new ArrayList<>(
          List.of(
              new Item("1", "Widget", 3), new Item("2", "Gadget", 5), new Item("3", "Gizmo", 8)));

  @UI("/perf/items")
  @Title("Items")
  public static class ItemsCrud extends AutoCrud<Item> {
    @Override
    public GridLayout gridLayout() {
      return GridLayout.table;
    }

    @Override
    public CrudStore<Item> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Item> findById(String id) {
          return ITEMS.stream().filter(i -> i.id.equals(id)).findFirst();
        }

        @Override
        public String save(Item entity) {
          return entity.id;
        }

        @Override
        public List<Item> findAll() {
          return ITEMS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  @UI("/perf/app")
  @Title("Perf app")
  public static class PerfApp {
    @Menu String form = "/perf/form";

    @Menu String items = "/perf/items";

    @Menu String wizard = "/perf/wizard";
  }

  public static class Who implements WizardStep {
    @NotEmpty public String name = "Ana";
  }

  public static class Confirm implements WizardStep {
    public String note = "n";
  }

  public static class Result implements WizardStep {
    @PlainText public String outcome = "pending";
  }

  @UI("/perf/wizard")
  @Title("Wizard")
  public static class PerfWizard extends Wizard {
    Who who = new Who();
    Confirm confirm = new Confirm();
    Result result;

    @WizardCompletionAction
    Object finish() {
      return Message.success("done");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SimpleForm.class, ItemsCrud.class, PerfApp.class, PerfWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── scenarios ─────────────────────────────────────────────────────────────

  static UIIncrementDto simpleForm() {
    return mateu.sync("/perf/form");
  }

  static UIIncrementDto crudList() {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/perf/items")
            .consumedRoute("/perf/items")
            .serverSideType(ItemsCrud.class.getName())
            .actionId("")
            .initiatorComponentId("c1_app")
            .build());
  }

  static UIIncrementDto crudSearch() {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/perf/items")
            .consumedRoute("/perf/items")
            .serverSideType(ItemsCrud.class.getName())
            .actionId("search")
            .initiatorComponentId("c1_app")
            .componentState(Map.of("page", 0, "size", 10, "searchText", ""))
            .build());
  }

  static UIIncrementDto appShell() {
    return mateu.sync("/perf/app");
  }

  static UIIncrementDto wizardNext() {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/perf/wizard")
            .actionId("next")
            .serverSideType(PerfWizard.class.getName())
            .componentState(Map.of("position", 0, "who-name", "Ana"))
            .build());
  }

  /** What one warm request costs: the lookups it made and the classes it walked for injection. */
  record Cost(Map<String, Integer> lookups, long injectionFieldScans) {
    int totalLookups() {
      return lookups.values().stream().mapToInt(Integer::intValue).sum();
    }
  }

  static Cost warmCost(Supplier<UIIncrementDto> scenario) {
    assertThat(scenario.get()).isNotNull(); // warm-up
    mateu.resetLookups();
    long scansBefore = ReflectionInstanceFactory.injectionFieldScans();
    assertThat(scenario.get()).isNotNull();
    return new Cost(
        new TreeMap<>(mateu.lookups()),
        ReflectionInstanceFactory.injectionFieldScans() - scansBefore);
  }

  static String bean(Class<?> type) {
    return "getBean " + type.getName();
  }

  static String beans(Class<?> type) {
    return "getBeans " + type.getName();
  }

  static Map<String, Integer> lookups(Object... pairs) {
    var out = new TreeMap<String, Integer>();
    for (int i = 0; i < pairs.length; i += 2) {
      out.put((String) pairs[i], (Integer) pairs[i + 1]);
    }
    return out;
  }

  static void assertBudget(
      String scenario, Supplier<UIIncrementDto> request, Map<String, Integer> lookups, long scans) {
    var cost = warmCost(request);
    System.out.println(
        "REQUEST BUDGET "
            + scenario
            + ": lookups="
            + cost.totalLookups()
            + " scans="
            + cost.injectionFieldScans()
            + " "
            + cost.lookups());
    assertThat(cost.lookups()).as(scenario + " container lookups").isEqualTo(lookups);
    assertThat(cost.injectionFieldScans()).as(scenario + " injection field scans").isEqualTo(scans);
  }

  @Test
  void aSimpleForm() {
    assertBudget(
        "simpleForm",
        RequestBudgetTest::simpleForm,
        lookups(
            bean(io.mateu.core.application.runaction.RouteRegistry.class), 2,
            bean(SimpleForm.class), 1,
            bean(Translator.class), 1,
            beans(io.mateu.core.domain.out.UiIncrementMapper.class), 1,
            beans(io.mateu.core.domain.ports.InstanceFactory.class), 1,
            beans(io.mateu.uidl.interfaces.ComponentAdapter.class), 6),
        0);
  }

  @Test
  void aCrudListing() {
    assertBudget(
        "crudList",
        RequestBudgetTest::crudList,
        lookups(
            bean(io.mateu.core.application.runaction.RouteRegistry.class), 3,
            bean(ItemsCrud.class), 1,
            beans(io.mateu.core.domain.out.UiIncrementMapper.class), 1,
            beans(io.mateu.core.domain.ports.InstanceFactory.class), 1,
            beans(io.mateu.uidl.interfaces.ComponentAdapter.class), 5,
            beans(io.mateu.uidl.interfaces.ListingExporter.class), 1),
        0);
  }

  @Test
  void aCrudSearch() {
    assertBudget(
        "crudSearch",
        RequestBudgetTest::crudSearch,
        lookups(
            bean(io.mateu.core.application.runaction.RouteRegistry.class), 1,
            bean(Item.class), 1,
            bean(ItemsCrud.class), 2,
            bean(io.mateu.uidl.interfaces.InstanceFactory.class), 1,
            beans(io.mateu.core.domain.out.UiIncrementMapper.class), 1,
            beans(io.mateu.core.domain.ports.InstanceFactory.class), 1,
            beans(io.mateu.uidl.interfaces.ComponentAdapter.class), 2),
        0);
  }

  @Test
  void anAppShell() {
    assertBudget(
        "appShell",
        RequestBudgetTest::appShell,
        lookups(
            bean(io.mateu.core.application.RoutedClassResolver.class), 1,
            bean(io.mateu.core.application.runaction.ActionRegistry.class), 1,
            bean(io.mateu.core.application.runaction.ComponentRegistry.class), 1,
            bean(io.mateu.core.application.runaction.RestSourceRegistry.class), 2,
            bean(io.mateu.core.application.runaction.RouteRegistry.class), 6,
            bean(PerfApp.class), 1,
            bean(Translator.class), 1,
            beans(io.mateu.core.domain.out.UiIncrementMapper.class), 1,
            beans(io.mateu.core.domain.ports.InstanceFactory.class), 1,
            beans(io.mateu.uidl.interfaces.ComponentAdapter.class), 2),
        0);
  }

  @Test
  void aWizardStep() {
    assertBudget(
        "wizardNext",
        RequestBudgetTest::wizardNext,
        lookups(
            bean(io.mateu.core.application.runaction.ActionRegistry.class), 1,
            bean(PerfWizard.class), 1,
            bean(Result.class), 1,
            bean(Who.class), 3,
            bean(io.mateu.uidl.interfaces.InstanceFactory.class), 3,
            bean(Translator.class), 1,
            beans(io.mateu.core.domain.out.UiIncrementMapper.class), 1,
            beans(io.mateu.core.domain.ports.InstanceFactory.class), 1,
            beans(io.mateu.uidl.interfaces.ComponentAdapter.class), 3),
        0);
  }

  /**
   * Informational, never a gate (timings depend on the machine): the p50 of 1000 warm requests per
   * scenario. Run with {@code -Dmateu.perf.timing=true}.
   */
  @Test
  @org.junit.jupiter.api.condition.EnabledIfSystemProperty(
      named = "mateu.perf.timing",
      matches = "true")
  void printsTheMedianTimeOfAWarmRequest() {
    var report = new StringBuilder("REQUEST TIMING (p50 of 1000, µs)\n");
    report
        .append("simpleForm ")
        .append(p50Micros(RequestBudgetTest::simpleForm, 1000))
        .append('\n');
    report.append("crudList ").append(p50Micros(RequestBudgetTest::crudList, 1000)).append('\n');
    report
        .append("crudSearch ")
        .append(p50Micros(RequestBudgetTest::crudSearch, 1000))
        .append('\n');
    report.append("appShell ").append(p50Micros(RequestBudgetTest::appShell, 1000)).append('\n');
    report
        .append("wizardNext ")
        .append(p50Micros(RequestBudgetTest::wizardNext, 1000))
        .append('\n');
    System.out.println(report);
  }

  static long p50Micros(Supplier<UIIncrementDto> scenario, int iterations) {
    for (int i = 0; i < 50; i++) scenario.get();
    long[] samples = new long[iterations];
    for (int i = 0; i < iterations; i++) {
      long t = System.nanoTime();
      scenario.get();
      samples[i] = (System.nanoTime() - t) / 1000;
    }
    Arrays.sort(samples);
    return samples[iterations / 2];
  }
}
