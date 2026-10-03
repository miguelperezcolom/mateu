package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.FeatureFlagGate;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.Humanizer;
import io.mateu.uidl.annotations.Subresource;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Pair;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

/**
 * {@code @Subresource}: a record's sub-listings, placed in its tabs (several stacked in one tab),
 * given the parent as context, lazy by default and counted on the tab when eager.
 */
@Slf4j
final class Subresources {

  /** Request attribute: the tab being rendered, so a sub-resource can tell what it repeats. */
  static final String CURRENT_TAB = "_subresourceTab";

  /** The tab being rendered: its label and how many sub-resources it holds. */
  record CurrentTab(String label, int subresources, int fields) {}

  private Subresources() {}

  static boolean isSubresource(Field field) {
    return MetaAnnotations.isPresent(field, Subresource.class);
  }

  static Subresource of(Field field) {
    return MetaAnnotations.find(field, Subresource.class);
  }

  /**
   * Moves every {@code @Subresource} field (one that does not open a {@code @Tab} of its own) into
   * the tab it names — an existing one matched by key or label, else a new one at the end — after
   * that tab's own fields, in {@code order}. A sub-resource whose {@code show} flag is off is left
   * out.
   */
  static void place(
      List<Pair<Tab, List<Field>>> fieldsPerTab, List<Field> noTabFields, HttpRequest httpRequest) {
    var moved = new ArrayList<Field>();
    noTabFields.removeIf(field -> movable(field) && moved.add(field));
    for (var pair : fieldsPerTab) {
      pair.second().removeIf(field -> movable(field) && moved.add(field));
    }
    if (moved.isEmpty()) {
      return;
    }
    moved.removeIf(field -> !FeatureFlagGate.shows(of(field).show(), httpRequest));
    // tabs open in declaration order; inside a tab, sub-resources follow their `order`
    var byTab = new LinkedHashMap<String, List<Field>>();
    for (var field : moved) {
      var spec = of(field).tab().isBlank() ? field.getName() : of(field).tab();
      byTab.computeIfAbsent(spec, key -> new ArrayList<>()).add(field);
    }
    for (var entry : byTab.entrySet()) {
      var spec = entry.getKey();
      var fields = entry.getValue();
      fields.sort(Comparator.comparingInt(field -> of(field).order()));
      var target = findTab(fieldsPerTab, spec);
      if (target == null) {
        target =
            new Pair<>(
                new SyntheticTab(label(spec), Humanizer.toKebabCase(spec)), new ArrayList<>());
        fieldsPerTab.add(target);
      }
      target.second().addAll(fields);
    }
  }

  private static boolean movable(Field field) {
    return isSubresource(field) && !MetaAnnotations.isPresent(field, Tab.class);
  }

  private static Pair<Tab, List<Field>> findTab(List<Pair<Tab, List<Field>>> tabs, String spec) {
    for (var pair : tabs) {
      var tab = pair.first();
      if (spec.equalsIgnoreCase(tab.key())
          || spec.equalsIgnoreCase(FormTabArranger.getTabName(pair))
          || label(spec).equalsIgnoreCase(FormTabArranger.getTabName(pair))) {
        return pair;
      }
    }
    return null;
  }

  private static String label(String spec) {
    return Humanizer.toUpperCaseFirst(spec.replace('-', ' '));
  }

  /** How many sub-resources a tab's fields hold. */
  static int count(List<Field> fields) {
    return (int) fields.stream().filter(Subresources::isSubresource).count();
  }

  /**
   * The tab badge for its EAGER sub-resources: their rows summed, or {@code null} when the tab has
   * none (or none could be counted).
   */
  static String badge(List<Field> fields, Object host, HttpRequest httpRequest) {
    long total = 0;
    var counted = false;
    for (var field : fields) {
      if (!isSubresource(field) || of(field).load() != Subresource.Load.EAGER) {
        continue;
      }
      var rows = rows(field, host, httpRequest);
      if (rows != null) {
        total += rows;
        counted = true;
      }
    }
    return counted ? String.valueOf(total) : null;
  }

  /** The rows an eager sub-listing has for this parent, or {@code null} when it cannot tell. */
  static Long rows(Field field, Object host, HttpRequest httpRequest) {
    try {
      var factory =
          io.mateu.uidl.di.MateuBeanProvider.getBean(
              io.mateu.uidl.interfaces.InstanceFactory.class);
      var listing =
          factory.newInstance(field.getType(), context(field, host, httpRequest), httpRequest);
      if (listing instanceof io.mateu.uidl.interfaces.Listing<?> l) {
        var data =
            l.search(
                new io.mateu.uidl.data.SearchRequest(
                    "", null, List.of(), new io.mateu.uidl.data.Pageable(0, 1, List.of())),
                httpRequest);
        return data != null && data.page() != null ? data.page().totalElements() : null;
      }
    } catch (Throwable t) {
      log.debug("@Subresource {}: no count ({})", field.getName(), t.toString());
    }
    return null;
  }

  /**
   * The parent, as the sub-listing's context: the host route's path parameters, the host's simple
   * field values whose names the listing also has, and the explicit {@code context} bindings.
   */
  static Map<String, Object> context(Field field, Object host, HttpRequest httpRequest) {
    var context = new LinkedHashMap<String, Object>();
    var listingFields = new java.util.HashSet<String>();
    for (var f : getAllFields(field.getType())) {
      listingFields.add(f.getName());
    }
    if (httpRequest != null && httpRequest.runActionRq() != null) {
      io.mateu.core.application.runaction.RouteChains.chainOf(httpRequest.runActionRq().route())
          .forEach(
              link ->
                  link.pathParams()
                      .forEach(
                          (name, value) -> {
                            if (listingFields.contains(name)) {
                              context.put(name, value);
                            }
                          }));
    }
    if (host != null && !(host instanceof Class)) {
      for (var hostField : getAllFields(host.getClass())) {
        if (hostField.equals(field)
            || Modifier.isStatic(hostField.getModifiers())
            || !listingFields.contains(hostField.getName())) {
          continue;
        }
        var value = simpleValue(hostField, host);
        if (value != null) {
          context.put(hostField.getName(), value);
        }
      }
      for (var binding : of(field).context()) {
        var parts = binding.split("=", 2);
        var target = parts[0].trim();
        var source = parts.length > 1 ? parts[1].trim() : target;
        var hostField =
            getAllFields(host.getClass()).stream()
                .filter(f -> f.getName().equals(source))
                .findFirst()
                .orElse(null);
        if (hostField == null) {
          throw new IllegalStateException(
              "@Subresource "
                  + field.getName()
                  + ": context '"
                  + binding
                  + "' names "
                  + source
                  + ", which "
                  + host.getClass().getSimpleName()
                  + " does not have");
        }
        var value = simpleValue(hostField, host);
        if (value != null) {
          context.put(target, value);
        }
      }
    }
    return context;
  }

  private static Object simpleValue(Field field, Object host) {
    var type = field.getType();
    var simple =
        String.class.equals(type)
            || Number.class.isAssignableFrom(type)
            || type.isPrimitive()
            || Boolean.class.equals(type)
            || type.isEnum();
    if (!simple) {
      return null;
    }
    try {
      field.setAccessible(true);
      var value = field.get(host);
      return value == null ? null : type.isEnum() ? value.toString() : value;
    } catch (Exception e) {
      return null;
    }
  }

  /** The sub-listing's title: its type's {@code @Title}, else the field name humanized. */
  static String title(Field field) {
    var title = MetaAnnotations.find(field.getType(), Title.class);
    if (title != null && !title.value().isBlank()) {
      return title.value();
    }
    return Humanizer.toUpperCaseFirst(field.getName());
  }

  /** A tab a sub-resource opens when it names none of the page's own. */
  record SyntheticTab(String value, String key) implements Tab {
    @Override
    public int order() {
      return 0;
    }

    @Override
    public String shortcut() {
      return "";
    }

    @Override
    public boolean open() {
      return false;
    }

    @Override
    public String show() {
      return "";
    }

    @Override
    public Class<? extends Annotation> annotationType() {
      return Tab.class;
    }
  }
}
