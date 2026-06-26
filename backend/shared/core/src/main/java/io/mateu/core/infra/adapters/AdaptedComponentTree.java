package io.mateu.core.infra.adapters;

import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StateSupplier;
import java.util.List;

/**
 * Bridges a domain object + its {@link ComponentAdapter} into the supplier interfaces the rendering
 * pipeline already understands, so the adapter's components + state + data flow unchanged. It
 * advertises the model's type as the {@code serverSideType} so the state routes back to the adapter
 * on actions.
 */
public class AdaptedComponentTree
    implements ComponentTreeSupplier, StateSupplier, DataSupplier, ActionSupplier {

  private final Object model;

  @SuppressWarnings("rawtypes")
  private final ComponentAdapter adapter;

  private AdaptedView cached;

  @SuppressWarnings("rawtypes")
  public AdaptedComponentTree(Object model, ComponentAdapter adapter) {
    this.model = model;
    this.adapter = adapter;
  }

  @SuppressWarnings("unchecked")
  private AdaptedView view(HttpRequest httpRequest) {
    if (cached == null) {
      cached = adapter.adapt(model, httpRequest);
    }
    return cached;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var components = view(httpRequest).components();
    if (components == null || components.isEmpty()) {
      return VerticalLayout.builder().build();
    }
    if (components.size() == 1) {
      return components.get(0);
    }
    return VerticalLayout.builder().style("width: 100%;").content(components).build();
  }

  @Override
  public Object state(HttpRequest httpRequest) {
    return view(httpRequest).state();
  }

  @Override
  public Object data(HttpRequest httpRequest) {
    return view(httpRequest).data();
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var ids = view(httpRequest).actions();
    if (ids == null || ids.isEmpty()) {
      return List.of();
    }
    return ids.stream().map(id -> Action.builder().id(id).build()).toList();
  }

  @Override
  public String id() {
    return model.getClass().getName();
  }

  @Override
  public String serverSideType() {
    return model.getClass().getName();
  }

  @Override
  public String style() {
    return "width: 100%;";
  }
}
