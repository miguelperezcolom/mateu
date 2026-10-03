package io.mateu.demo.staticvcn.java;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * One VCN (route {@code vcns/:id}, see specs/ui/routes.yaml), read-only. {@code @RestData} loads it on entry, straight from
 * the API, with the id the path seeds. Every button is client-side: two route links, and a delete
 * that is a confirmed {@code @RestAction} — confirm → DELETE → toast → back to the listing.
 */
@Title("${state.displayName}")
@Subtitle("Virtual cloud network")
@RestData(source = "vcn")
@Getter
@Setter
public class VcnDetail implements ToolbarSupplier {

  @Hidden String id;

  @ReadOnly
  @Label("Name")
  String displayName;

  @ReadOnly
  @Label("State")
  String lifecycleState;

  @ReadOnly
  @Label("CIDR block")
  String cidrBlock;

  @ReadOnly
  @Label("Compartment")
  String compartment;

  @ReadOnly
  @Label("DNS label")
  String dnsLabel;

  @ReadOnly
  @Label("Created")
  String timeCreated;

  /** Navigation only: a button whose actionable is a RouteLink navigates in the browser. */
  @Override
  public List<UserTrigger> toolbar() {
    return List.of(
        Button.builder()
            .label("Back to VCNs")
            .actionId("backToList")
            .actionable(new RouteLink("vcns", "Back to VCNs"))
            .build(),
        Button.builder()
            .label("Subnets")
            .actionId("subnets")
            .actionable(new RouteLink("vcns/${state.id}/subnets", "Subnets"))
            .build(),
        Button.builder().label("Delete").actionId("delete").color(ButtonColor.error).build());
  }

  @Toolbar
  @Action(
      confirmationRequired = true,
      confirmationTitle = "Delete VCN",
      confirmationMessage = "This deletes the VCN and its subnets.",
      confirmationText = "Delete",
      confirmationDenialText = "Cancel")
  @RestAction(source = "vcn-delete", successMessage = "VCN deleted", successRoute = "vcns")
  public void delete() {}
}
