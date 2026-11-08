package io.mateu.explorer.examples.behaviour.columnwidths;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;

/**
 * {@code @ColumnWidth("6rem")} fixes a column's width; {@code @ColumnWidth("auto")} sizes it to its
 * content (header and widest cell), so it never truncates whatever the density; a column without it
 * shares the remaining space.
 */
public class Shipments implements Listing<Shipments.Shipment> {

  public record Shipment(
      @ColumnWidth("6rem") String id,
      @ColumnWidth("auto") String carrier,
      String destination,
      @ColumnWidth("auto") String trackingCode) {}

  @Override
  public ListingData<Shipment> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(
        List.of(
            new Shipment("SH-1", "DHL Express", "Palma de Mallorca, Illes Balears", "JD014600006281234567"),
            new Shipment("SH-2", "UPS", "Madrid", "1Z999AA10123456784"),
            new Shipment("SH-3", "Correos", "Santiago de Compostela, A Coruña", "PQ4E7A0123456780108001V"),
            new Shipment("SH-4", "SEUR", "Valencia", "10001234567")));
  }
}
