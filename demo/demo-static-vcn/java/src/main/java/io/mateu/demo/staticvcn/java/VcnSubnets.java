package io.mateu.demo.staticvcn.java;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;

/**
 * The subnets of one VCN (route {@code vcns/:id/subnets}, see specs/ui/routes.yaml): a second listing scoped by the PARENT
 * id — the {@code vcn-subnets} source's url interpolates {@code ${state.id}}, which the path seeds.
 * A LINKED route, not a routed tab: routed tabs are P1 of design/maui-parity-plan.md.
 */
@Title("Subnets")
@RestListing(source = "vcn-subnets")
public class VcnSubnets implements Listing<VcnSubnets.Row> {

  public record Row(
      @Label("Name") String displayName,
      @Label("State")
          @Status(
              defaultStatus = StatusType.NONE,
              mappings = {
                @StatusMapping(from = "AVAILABLE", to = StatusType.SUCCESS),
                @StatusMapping(from = "PROVISIONING", to = StatusType.WARNING)
              })
          String lifecycleState,
      @Label("CIDR block") String cidrBlock) {}

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.of();
  }
}
