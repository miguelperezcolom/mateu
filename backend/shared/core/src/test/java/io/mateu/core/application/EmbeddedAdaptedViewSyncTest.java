package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * An {@link EmbeddedView} of an object a {@link ComponentAdapter} renders is drawn BY THE ADAPTER —
 * its components, state and actions — like the same object as a route or a form field. It used to
 * be reflected field by field (no adapter labels, no adapter actions).
 */
class EmbeddedAdaptedViewSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public static class Invoice {
    String customer = "Acme";
    double total = 120;
  }

  public static class InvoiceAdapter implements ComponentAdapter<Invoice> {
    @Override
    public Class<Invoice> type() {
      return Invoice.class;
    }

    @Override
    public AdaptedView adapt(Invoice model, HttpRequest httpRequest) {
      return new AdaptedView(
          List.of(new Text("Invoice for " + model.customer)),
          Map.of("customer", model.customer),
          Map.of(),
          List.of("issue"));
    }

    @Override
    public Invoice deserialize(Map<String, Object> state, HttpRequest httpRequest) {
      var invoice = new Invoice();
      if (state.containsKey("customer")) invoice.customer = String.valueOf(state.get("customer"));
      return invoice;
    }
  }

  @UI("/embedded-adapted")
  public static class BillingPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(new EmbeddedView(new Invoice()));
    }
  }

  private static List<ServerSideComponentDto> islands(
      Object node, List<ServerSideComponentDto> out) {
    if (node instanceof ServerSideComponentDto server) {
      out.add(server);
      server.children().forEach(c -> islands(c, out));
    } else if (node instanceof io.mateu.dtos.ClientSideComponentDto client) {
      client.children().forEach(c -> islands(c, out));
    }
    return out;
  }

  @Test
  void anEmbeddedAdaptedObjectIsDrawnByItsAdapter() {
    try (var mateu = TestMateu.withUisAndBeans(List.of(new InvoiceAdapter()), BillingPage.class)) {
      var increment = mateu.sync("/embedded-adapted");
      var wire = JSON.valueToTree(increment).toString();
      // the adapter's components, not the object's fields reflected one by one
      assertThat(wire).contains("Invoice for Acme");
      var island =
          increment.fragments().stream()
              .flatMap(f -> islands(f.component(), new ArrayList<>()).stream())
              .filter(s -> Invoice.class.getName().equals(s.serverSideType()))
              .findFirst()
              .orElseThrow(() -> new AssertionError("no Invoice island"));
      // … and its actions: they round-trip through the adapter
      assertThat(island.actions()).extracting(ActionDto::id).contains("issue");
    }
  }
}
