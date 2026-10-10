package io.mateu.springdata;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock;
import io.mateu.springdata.fixtures.Product;
import io.mateu.springdata.fixtures.Product.Category;
import io.mateu.springdata.fixtures.Repositories.ProductRepository;
import io.mateu.springdata.fixtures.Repositories.SupplierRepository;
import io.mateu.springdata.fixtures.Supplier;
import io.mateu.springdata.fixtures.TestJpaApp;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FilterCriterion;
import io.mateu.uidl.data.FilterOperator;
import io.mateu.uidl.data.GroupSummary;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
    classes = TestJpaApp.class,
    properties = "spring.jpa.properties.hibernate.generate_statistics=true")
class JpaCrudStoreTest {

  @Autowired ProductRepository products;
  @Autowired SupplierRepository suppliers;
  @Autowired EntityManager entityManager;

  JpaCrudStore<Product, Long> store;

  @BeforeEach
  void seed() {
    products.deleteAll();
    suppliers.deleteAll();
    var acme = suppliers.save(new Supplier("Acme"));
    var zeta = suppliers.save(new Supplier("Zeta"));
    products.saveAll(
        List.of(
            new Product(
                "Hammer", "Steel claw hammer", Category.TOOLS, 12.5, 10, day(2024, 1, 10), acme),
            new Product("Screwdriver", "Flat head", Category.TOOLS, 4.0, 0, day(2024, 3, 1), zeta),
            new Product(
                "Garden hose", "20m green hose", Category.GARDEN, 25.0, 3, day(2024, 5, 20), acme),
            new Product(
                "Rake", "Leaf rake 100% steel", Category.GARDEN, 15.0, 7, day(2025, 2, 2), zeta),
            new Product(
                "Kettle", "Electric kettle", Category.KITCHEN, 30.0, 5, day(2025, 6, 15), acme)));
    store = CrudStores.of(products);
  }

  private static LocalDate day(int year, int month, int day) {
    return LocalDate.of(year, month, day);
  }

  private static List<String> names(io.mateu.uidl.data.Page<Product> page) {
    return page.content().stream().map(p -> p.name).toList();
  }

  private static Pageable sortedBy(String field, Direction direction) {
    return new Pageable(0, 50, List.of(new Sort(field, direction)));
  }

  private static final Pageable BY_NAME = sortedBy("name", Direction.ascending);

  @Test
  void factoryReadsTheEntityAndIdTypesOffTheRepository() {
    assertThat(store.entityClass()).isEqualTo(Product.class);
    assertThat(store.idClass()).isEqualTo(Long.class);
  }

  @Test
  void crudOperationsConvertTheStringIdToTheEntityIdType() {
    var hammer = products.findAll().stream().filter(p -> p.name.equals("Hammer")).findFirst().get();
    assertThat(store.findById(hammer.id())).get().extracting(p -> p.name).isEqualTo("Hammer");
    assertThat(store.findById("not-a-number")).isEmpty();
    assertThat(store.findAll()).hasSize(5);

    var created = new Product("Saw", "Hand saw", Category.TOOLS, 9.0, 1, day(2025, 1, 1), null);
    var id = store.save(created);
    assertThat(id).isNotBlank();
    assertThat(store.findById(id)).isPresent();

    store.deleteAllById(List.of(id, hammer.id()));
    assertThat(store.findAll()).hasSize(4);
  }

  @Test
  void searchTextMatchesEveryWordInAnyStringAttributeCaseInsensitively() {
    assertThat(names(store.find("STEEL", null, BY_NAME))).containsExactly("Hammer", "Rake");
    // words in any order, each in some attribute (name or description)
    assertThat(names(store.find("hose green", null, BY_NAME))).containsExactly("Garden hose");
    assertThat(names(store.find("hammer flat", null, BY_NAME))).isEmpty();
    // like wildcards in the text are literal
    assertThat(names(store.find("100%", null, BY_NAME))).containsExactly("Rake");
    assertThat(names(store.find("_", null, BY_NAME))).isEmpty();
  }

  @Test
  void searchingInRestrictsTheSearchedAttributes() {
    var byName = store.searchingIn("name");
    assertThat(names(byName.find("steel", null, BY_NAME))).isEmpty();
    assertThat(names(byName.find("rake", null, BY_NAME))).containsExactly("Rake");
    // a path into an association
    assertThat(names(store.searchingIn("supplier.name").find("zeta", null, BY_NAME)))
        .containsExactly("Rake", "Screwdriver");
  }

  @Test
  void exampleFiltersOnlyApplyTheFieldsThatDifferFromAFreshInstance() {
    var filters = new Product();
    filters.category = Category.GARDEN;
    assertThat(names(store.find(null, filters, BY_NAME))).containsExactly("Garden hose", "Rake");

    filters = new Product();
    filters.name = "ER"; // strings: case-insensitive containment
    assertThat(names(store.find(null, filters, BY_NAME))).containsExactly("Hammer", "Screwdriver");

    filters = new Product();
    filters.stock = 7; // differs from the primitive default → applied, by equality
    assertThat(names(store.find(null, filters, BY_NAME))).containsExactly("Rake");

    // an untouched filters object (primitives at 0, version null) filters nothing
    assertThat(store.find(null, new Product(), BY_NAME).totalElements()).isEqualTo(5);
  }

  @Test
  void betweenCriterionIsInclusiveAndCoercesTheValues() {
    var criteria =
        List.of(
            new FilterCriterion(
                "released", FilterOperator.between, List.of(day(2024, 3, 1), day(2024, 5, 20))));
    assertThat(names(store.find(null, null, criteria, BY_NAME)))
        .containsExactly("Garden hose", "Screwdriver");
    // numbers from the wire arrive as Integer/Double whatever the attribute type
    var prices = List.of(new FilterCriterion("price", FilterOperator.between, List.of(10, 20)));
    assertThat(names(store.find(null, null, prices, BY_NAME))).containsExactly("Hammer", "Rake");
    // an open bound
    var from = new java.util.ArrayList<Object>();
    from.add(25);
    from.add(null);
    assertThat(
            names(
                store.find(
                    null,
                    null,
                    List.of(new FilterCriterion("price", FilterOperator.between, from)),
                    BY_NAME)))
        .containsExactly("Garden hose", "Kettle");
  }

  @Test
  void gteAndLteCriteria() {
    assertThat(
            names(
                store.find(
                    null,
                    null,
                    List.of(new FilterCriterion("stock", FilterOperator.gte, List.of(7))),
                    BY_NAME)))
        .containsExactly("Hammer", "Rake");
    assertThat(
            names(
                store.find(
                    null,
                    null,
                    List.of(
                        new FilterCriterion(
                            "released", FilterOperator.lte, List.of(day(2024, 3, 1)))),
                    BY_NAME)))
        .containsExactly("Hammer", "Screwdriver");
  }

  @Test
  void inCriterionAcceptsEnumConstantsAndTheirNames() {
    assertThat(
            names(
                store.find(
                    null,
                    null,
                    List.of(
                        new FilterCriterion(
                            "category", FilterOperator.in, List.of(Category.KITCHEN, "GARDEN"))),
                    BY_NAME)))
        .containsExactly("Garden hose", "Kettle", "Rake");
    // the id-set filter AutoCrud adds: String ids against a Long id
    var ids =
        products.findAll().stream()
            .filter(p -> p.name.startsWith("K") || p.name.startsWith("H"))
            .map(p -> (Object) p.id())
            .toList();
    assertThat(
            names(
                store.find(
                    null,
                    null,
                    List.of(new FilterCriterion("id", FilterOperator.in, ids)),
                    BY_NAME)))
        .containsExactly("Hammer", "Kettle");
  }

  @Test
  void criteriaOnAnAssociationPath() {
    assertThat(
            names(
                store.find(
                    null,
                    null,
                    List.of(
                        new FilterCriterion("supplier.name", FilterOperator.in, List.of("Acme"))),
                    BY_NAME)))
        .containsExactly("Garden hose", "Hammer", "Kettle");
  }

  @Test
  void searchFiltersAndCriteriaCombine() {
    var filters = new Product();
    filters.category = Category.TOOLS;
    var page =
        store.find(
            "h",
            filters,
            List.of(new FilterCriterion("price", FilterOperator.gte, List.of(5))),
            BY_NAME);
    assertThat(names(page)).containsExactly("Hammer");
  }

  @Test
  void pagesCarryTheTotalOfTheWholeResult() {
    var first =
        store.find(null, null, new Pageable(0, 2, List.of(new Sort("name", Direction.ascending))));
    assertThat(names(first)).containsExactly("Garden hose", "Hammer");
    assertThat(first.totalElements()).isEqualTo(5);
    assertThat(first.pageSize()).isEqualTo(2);
    var last =
        store.find(null, null, new Pageable(2, 2, List.of(new Sort("name", Direction.ascending))));
    assertThat(names(last)).containsExactly("Screwdriver");
    assertThat(last.pageNumber()).isEqualTo(2);
    // no pageable: everything, in one page
    assertThat(store.find(null, null, null).content()).hasSize(5);
  }

  @Test
  void paginationRunsOneCountAndOnePageQuery() {
    var statistics =
        entityManager.getEntityManagerFactory().unwrap(SessionFactory.class).getStatistics();
    statistics.clear();
    store.find("e", null, new Pageable(0, 2, List.of()));
    assertThat(statistics.getPrepareStatementCount()).isEqualTo(2);
  }

  @Test
  void sortsByAttributePathsAndSkipsUnknownKeys() {
    assertThat(names(store.find(null, null, sortedBy("price", Direction.descending))))
        .containsExactly("Kettle", "Garden hose", "Rake", "Hammer", "Screwdriver");
    var bySupplierThenName =
        new Pageable(
            0,
            50,
            List.of(
                new Sort("supplier.name", Direction.descending),
                new Sort("name", Direction.ascending)));
    assertThat(names(store.find(null, null, bySupplierThenName)))
        .containsExactly("Rake", "Screwdriver", "Garden hose", "Hammer", "Kettle");
    // a computed column has no attribute: ignored instead of failing the query
    assertThat(store.find(null, null, sortedBy("margin", Direction.ascending)).content())
        .hasSize(5);
  }

  @Test
  void aStaleSaveIsReportedAsMateusOptimisticLockConflict() {
    var id = products.findAll().get(0).id();
    var mine = store.findById(id).orElseThrow();
    var theirs = store.findById(id).orElseThrow();
    theirs.name = "Their change";
    store.save(theirs);
    mine.name = "My change";
    assertThatThrownBy(() -> store.save(mine))
        .isInstanceOf(OptimisticLock.StaleEditException.class);
    assertThat(store.findById(id).orElseThrow().name).isEqualTo("Their change");
  }

  @Test
  void theJpaVersionIsCheckedByMateuButIncrementedByTheProvider() throws Exception {
    var versionField = OptimisticLock.versionField(Product.class);
    assertThat(versionField).isPresent();
    assertThat(OptimisticLock.isStoreManaged(versionField.get())).isTrue();
    var product = store.findAll().get(0);
    var before = product.version;
    OptimisticLock.bump(product);
    assertThat(product.version).isEqualTo(before);
  }

  @Test
  void summariesRunInTheDatabaseWithAnEntityManager() {
    var aggregates = new LinkedHashMap<String, AggregateFunction>();
    aggregates.put("price", AggregateFunction.sum);
    aggregates.put("stock", AggregateFunction.max);
    aggregates.put("name", AggregateFunction.count);
    aggregates.put("description", AggregateFunction.avg); // not numeric: skipped
    var dbStore = CrudStores.of(products, entityManager);
    var summaries = dbStore.summaries(null, null, List.of(), aggregates, "category");
    assertThat(summaries.totals())
        .containsExactlyInAnyOrderEntriesOf(Map.of("price", 86.5, "stock", 10.0, "name", 5L));
    assertThat(summaries.groups())
        .extracting(GroupSummary::value)
        .containsExactly("GARDEN", "KITCHEN", "TOOLS");
    var garden = summaries.groups().get(0);
    assertThat(garden.count()).isEqualTo(2);
    assertThat(garden.aggregates()).containsEntry("price", 40.0).containsEntry("stock", 7.0);

    // same answer as the in-memory fallback, which aggregates the pushed-down search's rows
    var fallback = store.summaries(null, null, List.of(), aggregates, "category");
    assertThat(fallback.totals()).isEqualTo(summaries.totals());
    assertThat(fallback.groups()).isEqualTo(summaries.groups());
  }

  @Test
  void summariesHonourTheSameSearchAndCriteria() {
    var dbStore = CrudStores.of(products, entityManager);
    var summaries =
        dbStore.summaries(
            "steel",
            null,
            List.of(new FilterCriterion("stock", FilterOperator.gte, List.of(1))),
            Map.of("price", AggregateFunction.avg),
            null);
    assertThat(summaries.totals()).containsEntry("price", 13.75);
    assertThat(summaries.groups()).isEmpty();
  }
}
