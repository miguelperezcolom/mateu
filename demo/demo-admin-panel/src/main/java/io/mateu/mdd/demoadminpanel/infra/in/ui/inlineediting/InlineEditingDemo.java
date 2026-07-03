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
                            new LineItem(
                                    "Widget", 3, 9.90, true, LineCategory.STANDARD,
                                    java.time.LocalDate.now().plusDays(3), java.time.LocalTime.of(10, 30)),
                            new LineItem(
                                    "Gadget", 1, 19.50, false, LineCategory.PRIORITY,
                                    java.time.LocalDate.now().plusDays(7), java.time.LocalTime.of(16, 0))));

    @Toolbar
    @Label("Total")
    Object total(HttpRequest httpRequest) {
        double total = lines.stream().mapToDouble(l -> l.getPrice() * l.getQty()).sum();
        var first = lines.isEmpty() ? null : lines.get(0);
        return Message.success(
                "Líneas: " + lines.size() + " · Total: " + total
                        + (first != null
                                ? " · 1ª: " + first.getProduct() + "/" + first.getCategory()
                                        + "/" + first.getDeliveryDate() + "/" + first.getDeliveryTime()
                                : ""));
    }
}
