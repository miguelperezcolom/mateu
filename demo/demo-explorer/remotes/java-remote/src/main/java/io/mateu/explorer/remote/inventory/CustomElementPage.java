package io.mateu.explorer.remote.inventory;

import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * A screen drawing a custom element whose module this remote serves
 * ({@code static/inventory-assets/remote-badge.js}). The import is ROOT-RELATIVE: shown inside a
 * shell of another origin, the renderer loads it from the remote's origin, not the shell's — and
 * the remote must allow that origin for the path (ElementAssetsCors).
 */
public class CustomElementPage implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Form.builder()
        .title("A custom element served by the remote")
        .content(
            List.of(
                new Text(
                    "The badge below is a web component; its module comes from the remote's origin."),
                Element.builder()
                    .name("explorer-remote-badge")
                    .attributes(
                        Map.of("import", "/inventory-assets/remote-badge.js", "label", "Inventory"))
                    .build()))
        .build();
  }
}
