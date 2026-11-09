package io.mateu.explorer.examples.components.partial;

import io.mateu.uidl.data.ComponentEntry;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.interfaces.ComponentCatalogSupplier;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * The component catalogue, authored in code: a bean returning named, reusable compositions. A
 * {@code ComponentRef("ExplorerTicketPrices")} anywhere — Java, YAML, C#, Python — resolves to it.
 * (In data, the same entry would go in {@code specs/ui/components.yaml}; authored wins.)
 */
@Service
public class BusinessComponents implements ComponentCatalogSupplier {

  @Override
  public List<ComponentEntry> businessComponents() {
    return List.of(
        new ComponentEntry(
            "ExplorerTicketPrices",
            VerticalLayout.builder()
                .content(
                    List.of(
                        new Text("Tickets", TextContainer.h5),
                        new Text("Adult € 18 · Student € 9 · Under 18 free"),
                        new Text("Members enter free, any day")))
                .build()));
  }
}
