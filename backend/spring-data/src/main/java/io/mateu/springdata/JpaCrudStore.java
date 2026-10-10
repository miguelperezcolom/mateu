package io.mateu.springdata;

import io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock;
import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FilterCriterion;
import io.mateu.uidl.data.GroupSummary;
import io.mateu.uidl.data.ListingSummaries;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Selection;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * A ready-made {@link CrudStore} over a Spring Data JPA repository, so a JPA-backed {@code
 * AutoCrud} needs no hand-written adapter: {@code return CrudStores.of(productRepository);}.
 *
 * <p>The listing search ({@link #find(String, Identifiable, List, Pageable)}) runs in the database
 * as ONE JPA {@link Specification} plus a Spring Data page request — a count query and a page
 * query, whatever the table size:
 *
 * <ul>
 *   <li><b>search text</b> — split on whitespace; every word must be contained (case-insensitive
 *       {@code like}) in at least one searchable attribute: the entity's {@code String} attributes,
 *       or the ones named with {@link #searchingIn(String...)};
 *   <li><b>filters</b> (the example object) — a field counts as set only when its value differs
 *       from a freshly constructed instance of the filters class, exactly like the default {@code
 *       CrudStore.find}; strings match by case-insensitive containment, everything else by
 *       equality; fields the entity has no attribute for are ignored;
 *   <li><b>criteria</b> — {@code between} / {@code gte} / {@code lte} / {@code in} on the named
 *       attribute path ({@code customer.name} walks the association), values coerced to the
 *       attribute's type;
 *   <li><b>sort</b> — by attribute path; a sort key the entity has no attribute for (a computed
 *       column) is skipped, and the id is appended as a tie-breaker so pages are stable.
 * </ul>
 *
 * <p>{@link #summaries} (the {@code @Aggregate} totals and {@code @GroupBy} groups) runs as
 * aggregate queries in the database when the store has an {@link EntityManager} ({@code
 * CrudStores.of(repository, entityManager)}); without one it aggregates in memory over the rows the
 * pushed-down search returns.
 *
 * <p>A JPA {@code @Version} field takes part in Mateu's optimistic locking: a save carrying an
 * older version opens the usual conflict dialog (reload / overwrite), and a race the pre-check
 * cannot see — the provider's own {@link OptimisticLockingFailureException} — is reported the same
 * way. Keep the version field in the form state (annotate it {@code @Hidden}).
 *
 * @param <T> the JPA entity, which must be {@link Identifiable}
 * @param <ID> the entity's id type ({@code String}, {@code Long}, {@code Integer}, {@code UUID}…)
 */
@Experimental("new in 3.0; the search and summary semantics may still be refined")
public class JpaCrudStore<T extends Identifiable, ID> implements CrudStore<T> {

  private final JpaRepository<T, ID> repository;
  private final JpaSpecificationExecutor<T> specifications;
  private final Class<T> entityClass;
  private final Class<ID> idClass;
  private final EntityManager entityManager;
  private final List<String> searchAttributes;

  public JpaCrudStore(
      JpaRepository<T, ID> repository,
      JpaSpecificationExecutor<T> specifications,
      Class<T> entityClass,
      Class<ID> idClass) {
    this(repository, specifications, entityClass, idClass, null, null);
  }

  private JpaCrudStore(
      JpaRepository<T, ID> repository,
      JpaSpecificationExecutor<T> specifications,
      Class<T> entityClass,
      Class<ID> idClass,
      EntityManager entityManager,
      List<String> searchAttributes) {
    this.repository = Objects.requireNonNull(repository, "repository");
    this.specifications = Objects.requireNonNull(specifications, "specifications");
    this.entityClass = Objects.requireNonNull(entityClass, "entityClass");
    this.idClass = Objects.requireNonNull(idClass, "idClass");
    this.entityManager = entityManager;
    this.searchAttributes = searchAttributes;
  }

  /**
   * The attributes the free-text search looks in (attribute paths; default: every {@code String}
   * attribute of the entity).
   */
  public JpaCrudStore<T, ID> searchingIn(String... attributes) {
    return new JpaCrudStore<>(
        repository,
        specifications,
        entityClass,
        idClass,
        entityManager,
        List.copyOf(Arrays.asList(attributes)));
  }

  /** Enables the database-side {@link #summaries} (aggregate queries need an EntityManager). */
  public JpaCrudStore<T, ID> withEntityManager(EntityManager entityManager) {
    return new JpaCrudStore<>(
        repository, specifications, entityClass, idClass, entityManager, searchAttributes);
  }

  public Class<T> entityClass() {
    return entityClass;
  }

  public Class<ID> idClass() {
    return idClass;
  }

  // ---------------------------------------------------------------- the CRUD operations

  @Override
  public Optional<T> findById(String id) {
    ID typedId = toId(id);
    return typedId == null ? Optional.empty() : repository.findById(typedId);
  }

  /**
   * Saves (and flushes, so a version conflict surfaces here and not at some later commit) and
   * returns the id of the saved entity — the generated one for a new entity.
   */
  @Override
  public String save(T entity) {
    try {
      return repository.saveAndFlush(entity).id();
    } catch (OptimisticLockingFailureException | jakarta.persistence.OptimisticLockException e) {
      throw new OptimisticLock.StaleEditException(e);
    }
  }

  @Override
  public List<T> findAll() {
    return repository.findAll();
  }

  @Override
  public void deleteAllById(List<String> selectedIds) {
    if (selectedIds == null || selectedIds.isEmpty()) {
      return;
    }
    repository.deleteAllById(
        selectedIds.stream().map(this::toId).filter(Objects::nonNull).toList());
  }

  // ---------------------------------------------------------------- the listing search

  @Override
  public Page<T> find(
      String searchText, T filters, List<FilterCriterion> criteria, Pageable pageable) {
    Specification<T> specification =
        (root, query, cb) ->
            cb.and(predicates(root, cb, searchText, filters, criteria).toArray(Predicate[]::new));
    var sort = toSort(pageable);
    if (pageable != null && pageable.size() > 0) {
      var page =
          specifications.findAll(
              specification, PageRequest.of(Math.max(pageable.page(), 0), pageable.size(), sort));
      return new Page<>(
          "", pageable.size(), page.getNumber(), page.getTotalElements(), page.getContent());
    }
    var all = specifications.findAll(specification, sort);
    return new Page<>("", all.size(), 0, all.size(), all);
  }

  @Override
  public ListingSummaries summaries(
      String searchText,
      T filters,
      List<FilterCriterion> criteria,
      Map<String, AggregateFunction> aggregates,
      String groupByField) {
    boolean grouped = groupByField != null && !groupByField.isBlank();
    if ((aggregates == null || aggregates.isEmpty()) && !grouped) {
      return ListingSummaries.empty();
    }
    if (entityManager == null) {
      // no EntityManager to run aggregate queries with: aggregate in memory, but over the rows the
      // PUSHED-DOWN search returns, so totals and listing agree on what matches
      var rows = find(searchText, filters, criteria, null).content();
      return InMemorySummaries.of(rows, aggregates, grouped ? groupByField : null);
    }
    var totals = totals(searchText, filters, criteria, aggregates);
    List<GroupSummary> groups =
        grouped ? groups(searchText, filters, criteria, aggregates, groupByField) : List.of();
    return new ListingSummaries(totals, groups);
  }

  private Map<String, Object> totals(
      String searchText,
      T filters,
      List<FilterCriterion> criteria,
      Map<String, AggregateFunction> aggregates) {
    if (aggregates == null || aggregates.isEmpty()) {
      return Map.of();
    }
    var cb = entityManager.getCriteriaBuilder();
    var query = cb.createTupleQuery();
    Root<T> root = query.from(entityClass);
    var fields = new ArrayList<String>();
    var selections = new ArrayList<Selection<?>>();
    aggregates.forEach(
        (field, function) -> {
          var selection = aggregate(root, cb, field, function);
          if (selection != null) {
            fields.add(field);
            selections.add(selection);
          }
        });
    if (selections.isEmpty()) {
      return Map.of();
    }
    query
        .multiselect(selections)
        .where(predicates(root, cb, searchText, filters, criteria).toArray(Predicate[]::new));
    var tuple = entityManager.createQuery(query).getSingleResult();
    var result = new LinkedHashMap<String, Object>();
    for (int i = 0; i < fields.size(); i++) {
      putAggregate(result, fields.get(i), aggregates.get(fields.get(i)), tuple.get(i));
    }
    return result;
  }

  private List<GroupSummary> groups(
      String searchText,
      T filters,
      List<FilterCriterion> criteria,
      Map<String, AggregateFunction> aggregates,
      String groupByField) {
    var cb = entityManager.getCriteriaBuilder();
    var query = cb.createTupleQuery();
    Root<T> root = query.from(entityClass);
    Path<?> groupPath = path(root, groupByField);
    if (groupPath == null) {
      return List.of();
    }
    var fields = new ArrayList<String>();
    var selections = new ArrayList<Selection<?>>();
    selections.add(groupPath);
    selections.add(cb.count(root));
    if (aggregates != null) {
      aggregates.forEach(
          (field, function) -> {
            var selection = aggregate(root, cb, field, function);
            if (selection != null) {
              fields.add(field);
              selections.add(selection);
            }
          });
    }
    query
        .multiselect(selections)
        .where(predicates(root, cb, searchText, filters, criteria).toArray(Predicate[]::new))
        .groupBy(groupPath);
    var groups = new ArrayList<GroupSummary>();
    for (Tuple tuple : entityManager.createQuery(query).getResultList()) {
      var values = new LinkedHashMap<String, Object>();
      for (int i = 0; i < fields.size(); i++) {
        putAggregate(values, fields.get(i), aggregates.get(fields.get(i)), tuple.get(i + 2));
      }
      groups.add(
          new GroupSummary(
              String.valueOf(tuple.get(0)), ((Number) tuple.get(1)).longValue(), values));
    }
    // the listing orders a grouped listing by the group value, case-insensitively (the default
    // store's order); the database collation may differ, so the order is settled here
    groups.sort((a, b) -> String.CASE_INSENSITIVE_ORDER.compare(a.value(), b.value()));
    return groups;
  }

  @SuppressWarnings("unchecked")
  private Selection<?> aggregate(
      Root<T> root, CriteriaBuilder cb, String field, AggregateFunction function) {
    Path<?> path = path(root, field);
    if (path == null || function == null) {
      return null;
    }
    if (function == AggregateFunction.count) {
      return cb.count(path);
    }
    if (!Number.class.isAssignableFrom(Coercion.wrap(path.getJavaType()))) {
      // sum/avg/min/max of a non-numeric column: the default store skips it too
      return null;
    }
    var number = (Expression<Number>) path;
    return switch (function) {
      case sum -> cb.sum(number);
      case avg -> cb.avg(number);
      case min -> cb.min(number);
      case max -> cb.max(number);
      default -> null;
    };
  }

  /** Same shape as the default store: counts as long, everything else as double, nulls absent. */
  private static void putAggregate(
      Map<String, Object> target, String field, AggregateFunction function, Object value) {
    if (value == null) {
      return;
    }
    if (function == AggregateFunction.count) {
      target.put(field, ((Number) value).longValue());
    } else if (value instanceof Number number) {
      target.put(field, number.doubleValue());
    }
  }

  // ---------------------------------------------------------------- predicates

  private List<Predicate> predicates(
      Root<T> root,
      CriteriaBuilder cb,
      String searchText,
      Object filters,
      List<FilterCriterion> criteria) {
    var predicates = new ArrayList<Predicate>();
    searchPredicate(root, cb, searchText).ifPresent(predicates::add);
    predicates.addAll(filterPredicates(root, cb, filters));
    predicates.addAll(criteriaPredicates(root, cb, criteria));
    return predicates;
  }

  /** Every word in at least one searchable attribute. */
  private Optional<Predicate> searchPredicate(Root<T> root, CriteriaBuilder cb, String searchText) {
    if (searchText == null || searchText.isBlank()) {
      return Optional.empty();
    }
    var attributes = new ArrayList<Expression<String>>();
    for (String name : searchableAttributes(root)) {
      Path<?> path = path(root, name);
      if (path != null && path.getJavaType() == String.class) {
        @SuppressWarnings("unchecked")
        var text = (Expression<String>) path;
        attributes.add(cb.lower(text));
      }
    }
    if (attributes.isEmpty()) {
      // nothing to search in: a search over no text matches nothing
      return Optional.of(cb.disjunction());
    }
    var words = new ArrayList<Predicate>();
    for (String word : searchText.trim().split("\\s+")) {
      var pattern = "%" + escapeLike(word.toLowerCase()) + "%";
      words.add(
          cb.or(
              attributes.stream()
                  .map(attribute -> cb.like(attribute, pattern, '\\'))
                  .toArray(Predicate[]::new)));
    }
    return Optional.of(cb.and(words.toArray(Predicate[]::new)));
  }

  private List<String> searchableAttributes(Root<T> root) {
    if (searchAttributes != null) {
      return searchAttributes;
    }
    return root.getModel().getSingularAttributes().stream()
        .filter(attribute -> attribute.getJavaType() == String.class)
        .map(attribute -> attribute.getName())
        .sorted()
        .toList();
  }

  private static String escapeLike(String text) {
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
  }

  /**
   * The example object: a field counts as set when it differs from a freshly built instance of its
   * class (the filters are hydrated from the component state, so untouched fields keep their
   * initializers and primitive defaults) — the same rule as the default {@code CrudStore.find}.
   */
  private List<Predicate> filterPredicates(Root<T> root, CriteriaBuilder cb, Object filters) {
    if (filters == null) {
      return List.of();
    }
    var predicates = new ArrayList<Predicate>();
    Object defaults = Reflection.defaultsInstance(filters.getClass());
    for (Class<?> c = filters.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
      for (Field field : c.getDeclaredFields()) {
        if (field.isSynthetic() || Modifier.isStatic(field.getModifiers())) {
          continue;
        }
        Object value;
        Object defaultValue;
        try {
          field.setAccessible(true);
          value = field.get(filters);
          defaultValue = defaults != null ? field.get(defaults) : null;
        } catch (ReflectiveOperationException | RuntimeException unreadable) {
          continue;
        }
        if (value == null || !Reflection.isBasic(value)) {
          continue;
        }
        if (value instanceof String s && s.isBlank()) {
          continue;
        }
        if (defaults != null && Objects.equals(value, defaultValue)) {
          continue;
        }
        Path<?> path = attribute(root, field.getName());
        if (path == null) {
          continue;
        }
        if (value instanceof String s && path.getJavaType() == String.class) {
          @SuppressWarnings("unchecked")
          var text = (Expression<String>) path;
          predicates.add(cb.like(cb.lower(text), "%" + escapeLike(s.toLowerCase()) + "%", '\\'));
        } else {
          predicates.add(cb.equal(path, Coercion.to(value, path.getJavaType())));
        }
      }
    }
    return predicates;
  }

  @SuppressWarnings({"unchecked", "rawtypes"})
  private List<Predicate> criteriaPredicates(
      Root<T> root, CriteriaBuilder cb, List<FilterCriterion> criteria) {
    if (criteria == null || criteria.isEmpty()) {
      return List.of();
    }
    var predicates = new ArrayList<Predicate>();
    for (FilterCriterion criterion : criteria) {
      if (criterion == null
          || criterion.operator() == null
          || criterion.values() == null
          || criterion.values().isEmpty()) {
        continue;
      }
      Path path = path(root, criterion.field());
      if (path == null) {
        continue;
      }
      Class<?> type = path.getJavaType();
      var values = criterion.values();
      switch (criterion.operator()) {
        case between -> {
          var from = (Comparable) Coercion.to(values.get(0), type);
          var to = values.size() > 1 ? (Comparable) Coercion.to(values.get(1), type) : null;
          if (from != null && to != null) {
            predicates.add(cb.between(path, from, to));
          } else if (from != null) {
            predicates.add(cb.greaterThanOrEqualTo(path, from));
          } else if (to != null) {
            predicates.add(cb.lessThanOrEqualTo(path, to));
          }
        }
        case gte -> {
          var bound = (Comparable) Coercion.to(values.get(0), type);
          if (bound != null) {
            predicates.add(cb.greaterThanOrEqualTo(path, bound));
          }
        }
        case lte -> {
          var bound = (Comparable) Coercion.to(values.get(0), type);
          if (bound != null) {
            predicates.add(cb.lessThanOrEqualTo(path, bound));
          }
        }
        case in -> {
          var accepted =
              values.stream()
                  .map(value -> Coercion.to(value, type))
                  .filter(Objects::nonNull)
                  .toList();
          predicates.add(accepted.isEmpty() ? cb.disjunction() : path.in(accepted));
        }
      }
    }
    return predicates;
  }

  /** An attribute path ({@code a.b.c}), or null when the entity has no such attribute. */
  private static Path<?> path(Root<?> root, String dotted) {
    if (dotted == null || dotted.isBlank()) {
      return null;
    }
    try {
      Path<?> path = root;
      for (String segment : dotted.split("\\.")) {
        path = path.get(segment);
      }
      return path;
    } catch (IllegalArgumentException | IllegalStateException noSuchAttribute) {
      return null;
    }
  }

  /** A top-level attribute, or null (a filters class may carry fields the entity has not). */
  private static Path<?> attribute(Root<?> root, String name) {
    try {
      root.getModel().getAttribute(name);
    } catch (IllegalArgumentException noSuchAttribute) {
      return null;
    }
    return path(root, name);
  }

  // ---------------------------------------------------------------- sort and ids

  private Sort toSort(Pageable pageable) {
    var orders = new ArrayList<Sort.Order>();
    if (pageable != null && pageable.sort() != null) {
      for (var sort : pageable.sort()) {
        if (sort == null || sort.field() == null || sort.field().isBlank()) {
          continue;
        }
        if (!Reflection.hasPath(entityClass, sort.field())) {
          // a computed column has no attribute to order by in the database
          continue;
        }
        orders.add(
            sort.direction() == Direction.descending
                ? Sort.Order.desc(sort.field())
                : Sort.Order.asc(sort.field()));
      }
    }
    // the id as last key: without a total order the database may return a row on two pages
    Reflection.idAttribute(entityClass)
        .filter(id -> orders.stream().noneMatch(order -> order.getProperty().equals(id)))
        .ifPresent(id -> orders.add(Sort.Order.asc(id)));
    return orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
  }

  @SuppressWarnings("unchecked")
  private ID toId(String id) {
    if (id == null) {
      return null;
    }
    try {
      return (ID) Coercion.to(id, idClass);
    } catch (RuntimeException notAnId) {
      return null;
    }
  }
}
