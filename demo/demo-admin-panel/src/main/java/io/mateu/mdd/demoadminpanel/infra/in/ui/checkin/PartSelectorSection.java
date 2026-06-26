package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.Map;

/**
 * Button bar of the master-detail check-in screen (v3). Each button emits a "part-selected" event
 * carrying the part id; the embedded {@link PartView}'s entity ({@link PartModel}) subscribes to it
 * and reloads the detail in place with the chosen part. Rendered inline so the buttons sit on the
 * detail's title row.
 */
@PlainText
@Title("Ver")
public class PartSelectorSection {

    @Toolbar @Label("Cliente")
    Object cliente(HttpRequest httpRequest) { return select("cliente"); }

    @Toolbar @Label("Importes")
    Object importes(HttpRequest httpRequest) { return select("importes"); }

    @Toolbar @Label("Habitación")
    Object habitacion(HttpRequest httpRequest) { return select("habitacion"); }

    @Toolbar @Label("Historial")
    Object historial(HttpRequest httpRequest) { return select("historial"); }

    @Toolbar @Label("Folios")
    Object folios(HttpRequest httpRequest) { return select("folios"); }

    private static Object select(String partId) {
        return UICommand.dispatchEvent("part-selected", Map.of("partId", partId));
    }
}
