package io.mateu.demo.staticvcn.java;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;

/**
 * The VCN listing. {@code @RestListing} makes the BROWSER fetch the rows from the API; with the
 * whole collection in hand it searches, filters and pages by itself. {@code rowRoute} opens a
 * record by its own URL, client-side. {@link #search} is never called — there is no server to call
 * it on.
 */
@Title("Virtual cloud networks")
@RestListing(source = "vcns", rowRoute = "vcns/${row.id}")
public class Vcns implements Listing<Vcns.Row>, Filterable<Vcns.Filters>, Searchable {

  public enum Compartment {
    prod,
    dev,
    sandbox
  }

  public enum LifecycleState {
    AVAILABLE,
    PROVISIONING,
    TERMINATING
  }

  public record Filters(
      Compartment compartment, @Label("State") LifecycleState lifecycleState) {}

  public record Row(
      @Label("Name") String displayName,
      @Label("State")
          @Status(
              defaultStatus = StatusType.NONE,
              mappings = {
                @StatusMapping(from = "AVAILABLE", to = StatusType.SUCCESS),
                @StatusMapping(from = "PROVISIONING", to = StatusType.WARNING),
                @StatusMapping(from = "TERMINATING", to = StatusType.WARNING)
              })
          String lifecycleState,
      @Label("CIDR block") String cidrBlock,
      @Label("Compartment") String compartment) {}

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.of();
  }
}
