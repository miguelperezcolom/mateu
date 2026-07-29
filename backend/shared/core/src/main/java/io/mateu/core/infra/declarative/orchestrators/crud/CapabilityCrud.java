package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.Creatable;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.Editable;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.Searchable;
import java.util.List;

/**
 * Bridges a plain routed {@link Listing} that declares interaction capabilities ({@link Navigable},
 * {@link Editable}, {@link Creatable}, {@link Deletable}) into the CRUD orchestration engine: the
 * page becomes a mediator serving ONLY the routes/buttons of the declared capabilities — rows are
 * clickable only when Navigable, New appears only when Creatable, selection+Delete only when
 * Deletable, and an Editable-without-Navigable listing opens the editor in a drawer over the
 * listing (the "editable listing" idiom). Same substitution pattern as {@code
 * AdaptedComponentTree}/{@code InferredDashboard}: the wire advertises the LISTING's class as
 * serverSideType, so round-trips re-create the listing and re-bridge it here.
 */
@SuppressWarnings({"unchecked", "rawtypes"})
public class CapabilityCrud extends Crud<Object, Object, Object, Object, Object, Object> {

  private final Listing<Object> target;

  public CapabilityCrud(Object target) {
    this.target = (Listing<Object>) target;
  }

  /** A plain routed listing (no orchestrator) declaring at least one interaction capability. */
  public static boolean bridgeable(Object instance) {
    return instance instanceof Listing<?>
        && !(instance instanceof RouteHandler)
        && (instance instanceof Navigable<?, ?>
            || instance instanceof Editable<?, ?>
            || instance instanceof Creatable<?, ?>
            || instance instanceof Deletable<?>);
  }

  public static Object bridgeIfNeeded(Object instance) {
    return bridgeable(instance) ? new CapabilityCrud(instance) : instance;
  }

  public Object target() {
    return target;
  }

  // ── lifecycle delegation ──────────────────────────────────────────────────

  @Override
  public ListingData<Object> search(SearchRequest request, HttpRequest httpRequest) {
    return target.search(request, httpRequest);
  }

  @Override
  public Object view(Object id, HttpRequest httpRequest) {
    if (!canView()) throw new UnsupportedOperationException("not navigable");
    return ((Navigable<Object, Object>) target).view(id, httpRequest);
  }

  @Override
  public Object edit(Object id, HttpRequest httpRequest) {
    if (!canEdit()) throw new UnsupportedOperationException("not editable");
    return ((Editable<Object, Object>) target).edit(id, httpRequest);
  }

  @Override
  public Object save(HttpRequest httpRequest) {
    if (!canEdit()) throw new UnsupportedOperationException("not editable");
    return ((Editable<Object, Object>) target).save(httpRequest);
  }

  @Override
  public Object creationForm(HttpRequest httpRequest) {
    if (!canCreate()) throw new UnsupportedOperationException("not creatable");
    return ((Creatable<Object, Object>) target).creationForm(httpRequest);
  }

  @Override
  public Object create(HttpRequest httpRequest) {
    if (!canCreate()) throw new UnsupportedOperationException("not creatable");
    return ((Creatable<Object, Object>) target).create(httpRequest);
  }

  @Override
  public void deleteAllById(List<Object> selectedIds, HttpRequest httpRequest) {
    if (!canDelete()) throw new UnsupportedOperationException("not deletable");
    ((Deletable<Object>) target).deleteAllById(selectedIds, httpRequest);
  }

  // ── capabilities, from what the listing declares ──────────────────────────

  @Override
  public boolean canView() {
    return target instanceof Navigable<?, ?>;
  }

  @Override
  public boolean canEdit() {
    return target instanceof Editable<?, ?>;
  }

  @Override
  public boolean canCreate() {
    return target instanceof Creatable<?, ?>;
  }

  @Override
  public boolean canDelete() {
    return target instanceof Deletable<?>;
  }

  @Override
  public boolean searchable() {
    return target instanceof Searchable;
  }

  @Override
  public boolean selectionEnabled() {
    return canDelete() || target.selectionEnabled();
  }

  /** Editable without Navigable = the "editable listing": rows open the editor in a drawer. */
  @Override
  public boolean editInDrawer() {
    return canEdit() && !canView();
  }

  @Override
  public GridLayout gridLayout() {
    return target.gridLayout();
  }

  // ── type reflection over the listing's declarations ───────────────────────

  @Override
  public Class rowClass() {
    return target.rowClass();
  }

  @Override
  public Class filtersClass() {
    return target instanceof Filterable<?> filterable ? filterable.filtersClass() : NoFilters.class;
  }

  @Override
  public Class<?> viewClass() {
    return capabilityClass(Navigable.class, "Detail");
  }

  @Override
  public Class editorClass() {
    return capabilityClass(Editable.class, "Editor");
  }

  @Override
  public Class creationFormClass() {
    return capabilityClass(Creatable.class, "Form");
  }

  @Override
  public Class<?> entityClass() {
    return rowClass();
  }

  @Override
  public Class idClass() {
    for (Class<?> capability : List.of(Navigable.class, Editable.class, Creatable.class)) {
      if (capability.isInstance(target)) {
        var id = genericOrNull(capability, "Id");
        if (id != null) return id;
      }
    }
    if (target instanceof Deletable<?>) {
      var id = genericOrNull(Deletable.class, "Id");
      if (id != null) return id;
    }
    return String.class;
  }

  private Class capabilityClass(Class<?> capability, String param) {
    if (capability.isInstance(target)) {
      var resolved = genericOrNull(capability, param);
      if (resolved != null) return resolved;
    }
    return rowClass();
  }

  private Class genericOrNull(Class<?> capability, String param) {
    try {
      return getGenericClass(target.getClass(), capability, param);
    } catch (RuntimeException e) {
      return null;
    }
  }

  // ── identity & metadata of the underlying listing ─────────────────────────

  @Override
  public String serverSideTypeName() {
    return target.getClass().getName();
  }

  @Override
  public Class<?> metadataSource() {
    return target.getClass();
  }

  @Override
  protected Object stateSource() {
    return target;
  }

  @Override
  public Object behaviourSource() {
    return target;
  }
}
