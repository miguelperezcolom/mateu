package io.mateu.mdd.demoadminpanel.infra.in.ui.inlineediting;

import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Demonstrates {@link InlineEditing}: the order lines are edited directly in the grid cells (no
 * separate detail form). The "Total" action reads the (edited) list back to prove the round-trip.
 */
@Service
@Scope("prototype")
@Route(value = "/inline-editing", parentRoute = "")
@Title("Inline editing")
public class InlineEditingDemo {

    @Label("Líneas del pedido")
    @Stereotype(FieldStereotype.grid)
    @InlineEditing
    List<LineItem> lines =
            new ArrayList<>(
                    List.of(
                            new LineItem("Widget", 3, 9.90, true),
                            new LineItem("Gadget", 1, 19.50, false)));

    @Toolbar
    @Label("Total")
    Object total(HttpRequest httpRequest) {
        double total = lines.stream().mapToDouble(l -> l.getPrice() * l.getQty()).sum();
        return Message.success("Líneas: " + lines.size() + " · Total: " + total);
    }
}
