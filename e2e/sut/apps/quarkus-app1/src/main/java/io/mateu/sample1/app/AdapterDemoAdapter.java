package io.mateu.sample1.app;

import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import jakarta.enterprise.context.ApplicationScoped;
import io.quarkus.arc.Unremovable;

/**
 * A {@link ComponentAdapter} for {@link AdapterDemo}: it teaches Mateu how to render the plain
 * object (components + state) and how to rebuild it from the state returned on an action.
 * Registered automatically because it is a CDI bean ({@code @ApplicationScoped}).
 *
 * <p>{@code @Unremovable} is required on Quarkus: the adapter is discovered reflectively via the
 * {@code BeanManager} and never injected, so Arc's unused-bean removal would prune it otherwise.
 * {@code QuarkusBeanProvider} resolves the parameterized {@code ComponentAdapter<AdapterDemo>} bean
 * via an {@code @Any} scan.
 */
@ApplicationScoped
@Unremovable
public class AdapterDemoAdapter implements ComponentAdapter<AdapterDemo> {

  @Override
  public Class<AdapterDemo> type() {
    return AdapterDemo.class;
  }

  @Override
  public AdaptedView adapt(AdapterDemo model, HttpRequest httpRequest) {
    var form =
        FormLayout.builder()
            .autoResponsive(true)
            .content(
                List.of(
                    FormField.builder().id("code").label("Code").dataType(FieldDataType.string).build(),
                    FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build(),
                    FormField.builder()
                        .id("quantity")
                        .label("Quantity")
                        .dataType(FieldDataType.integer)
                        .build()))
            .build();

    var page =
        PageView.builder()
            .title("Product (adapted)")
            .subtitle("Rendered by AdapterDemoAdapter — AdapterDemo is not a Mateu component")
            .contentItem(form)
            .toolbarItem(new Button("Save", "save"))
            .build();

    Map<String, Object> state = new LinkedHashMap<>();
    state.put("code", model.code);
    state.put("name", model.name);
    state.put("quantity", model.quantity);

    return AdaptedView.of(page, state, List.of("save"));
  }

  @Override
  public AdapterDemo deserialize(Map<String, Object> state, HttpRequest httpRequest) {
    // Only overwrite keys present in the incoming state, so field initializers survive an empty
    // state (the initial load that builds the route instance).
    var model = new AdapterDemo();
    if (state.containsKey("code")) {
      model.code = asString(state.get("code"));
    }
    if (state.containsKey("name")) {
      model.name = asString(state.get("name"));
    }
    if (state.containsKey("quantity")) {
      model.quantity = asInt(state.get("quantity"));
    }
    return model;
  }

  private static String asString(Object v) {
    return v != null ? String.valueOf(v) : null;
  }

  private static int asInt(Object v) {
    if (v == null || String.valueOf(v).isBlank()) {
      return 0;
    }
    return (int) Double.parseDouble(String.valueOf(v));
  }
}
