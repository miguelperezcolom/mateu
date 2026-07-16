package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.editableview.EditableView;
import io.mateu.mdd.demofrontoffice.domain.guest.Guest;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import reactor.core.publisher.Flux;

/**
 * The Documento block of the Identidad step as an ORCHESTRATED embedded element (a {@link
 * EditableView} island, {@code @Inline} inside the step's section): the backend decides which of
 * its three states renders —
 *
 * <ul>
 *   <li><b>Sin datos</b> — a warning notice plus a "Escanear documento" button; the scan streams a
 *       simulated progress dialog ({@link LongTask} over SSE) and, when done, verifies the identity
 *       in the domain and reloads the island into…
 *   <li><b>Hay datos</b> — a property list with the document data and the built-in Edit toolbar
 *       button;
 *   <li><b>Editor</b> — the editable form; Save persists and lands back on "hay datos" (the
 *       standard EditableView save → /view cycle).
 * </ul>
 *
 * <p>The island receives the {@code stayId} from the host step via the embedded field's seeded
 * initialData, reloads itself on the {@code documento-escaneado} event (subscription lives on the
 * loaded empty-state model; the route flip forces the embedded mediator to re-render), and never
 * touches the rest of the wizard.
 */
@Getter
@Setter
@UI("/checkin-documento")
@Title("Documento")
public class DocumentoView extends EditableView<Object, DocumentoView.DocumentoEditor> {

  @Hidden String stayId;
  @Hidden boolean vistaAlterna;

  // ── the three states' models ─────────────────────────────────────────────────

  /** Sin datos: aviso + escanear (the subscription reloads the island after the scan). */
  @Getter
  @Setter
  @Title("Documento")
  @SubscribeTo(event = "documento-escaneado", action = "reloadDocumento")
  public static class DocumentoPendiente {
    @io.mateu.uidl.annotations.Notice(theme = "warning")
    String aviso = "Documento pendiente de escaneo";

    @Label("")
    Button escanear = new Button("Escanear documento", "escanear");
  }

  /** Hay datos: read-only property list (label left / value right). */
  @Getter
  @Setter
  @Title("Documento")
  public static class DocumentoDatos {
    @Section(value = "", propertyList = true, frameless = true)
    @Label("Documento")
    String documento;

    @Label("Nombre")
    String nombre;

    @Label("Email")
    String email;

    @Label("Teléfono")
    String telefono;
  }

  /** Editor: contact data editable; identity fields stay read-only. */
  @Getter
  @Setter
  @Title("Documento")
  public static class DocumentoEditor {
    @PlainText
    @Label("Documento")
    String documento;

    @PlainText
    @Label("Nombre")
    String nombre;

    @Label("Email")
    String email;

    @Label("Teléfono")
    String telefono;
  }

  // ── state selection ──────────────────────────────────────────────────────────

  @Override
  public Object view(HttpRequest httpRequest) {
    var guest = guest();
    if (guest == null || !guest.identityComplete()) {
      return new DocumentoPendiente();
    }
    return fill(new DocumentoDatos(), guest);
  }

  @Override
  public DocumentoEditor editor(HttpRequest httpRequest) {
    var editor = new DocumentoEditor();
    var guest = guest();
    if (guest != null) {
      editor.setDocumento("✓ Verificado — " + guest.document());
      editor.setNombre(guest.name());
      editor.setEmail(guest.email());
      editor.setTelefono(guest.phone());
    }
    return editor;
  }

  @Override
  public void save(HttpRequest httpRequest) {
    var edited = httpRequest.getInitiatorState(DocumentoEditor.class);
    var guest = guest();
    if (guest != null && edited != null) {
      FrontOffice.guests().save(guest.updateContact(edited.getEmail(), edited.getTelefono()));
    }
  }

  /** No Edit button while there is no data — the empty state only offers the scan. */
  @Override
  public boolean readOnly() {
    var guest = guest();
    return guest == null || !guest.identityComplete();
  }

  // ── actions ──────────────────────────────────────────────────────────────────

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<>(super.actions(httpRequest));
    actions.add(Action.builder().id("escanear").sse(true).build());
    actions.add(Action.builder().id("reloadDocumento").build());
    return actions;
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    return switch (actionId) {
      case "escanear" ->
          LongTask.create("Escaneando documento…")
              .withProgressBar()
              .done("Documento verificado", "Identidad leída del documento")
              .closeAfter(1)
              .withCommand(UICommand.dispatchEvent("documento-escaneado"))
              .run(
                  progress ->
                      Flux.range(1, 4)
                          .delayElements(Duration.ofMillis(450))
                          .map(
                              i -> {
                                if (i == 4) {
                                  simulateScan();
                                }
                                return progress.step(SCAN_STEPS[i - 1], i / 4.0);
                              }));
      case "reloadDocumento" -> {
        // the embedded mediator only re-renders on a route change — alternate the view route
        vistaAlterna = !vistaAlterna;
        setRouteTo(vistaAlterna ? "/view" : "/");
        yield new State(this);
      }
      default -> super.handleAction(actionId, httpRequest);
    };
  }

  private static final String[] SCAN_STEPS = {
    "Encendiendo el escáner…", "Leyendo el documento…", "Extrayendo los datos…", "Verificando la identidad…"
  };

  /** The same demo shortcut the wizard used to offer: verify + fill the contact data. */
  private void simulateScan() {
    var guest = guest();
    if (guest == null) {
      return;
    }
    if (!guest.identityComplete()) {
      var document =
          guest.document() == null || guest.document().isBlank()
              ? "ESC-" + guest.id().toUpperCase()
              : guest.document();
      guest = guest.verifyIdentity(document);
    }
    if (guest.email() == null || guest.email().isBlank()) {
      guest =
          guest.updateContact(
              guest.name().toLowerCase().replace(' ', '.').replace("í", "i").replace("é", "e")
                  + "@email.com",
              guest.phone() == null || guest.phone().isBlank() ? "+00 000 000 000" : guest.phone());
    }
    FrontOffice.guests().save(guest);
  }

  private Guest guest() {
    if (stayId == null || stayId.isBlank()) {
      return null;
    }
    return FrontOffice.stayView(stayId).guest();
  }

  private DocumentoDatos fill(DocumentoDatos datos, Guest guest) {
    datos.setDocumento("✓ Verificado — " + guest.document());
    datos.setNombre(guest.name());
    datos.setEmail(guest.email());
    datos.setTelefono(guest.phone());
    return datos;
  }
}
