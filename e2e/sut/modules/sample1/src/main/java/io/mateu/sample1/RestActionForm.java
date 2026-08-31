package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

/**
 * A button that calls a REST endpoint CLIENT-SIDE and merges the response into the form. Clicking
 * "Look up address" fetches a same-origin JSON ({@code static/rest-action-demo.json} =
 * {@code {"address": {"street": ..., "city": ...}}}); {@code resultPath="address"} merges
 * {@code {street, city}} into the form state, so the fields fill in, and a success toast shows.
 * The method body is never executed — the call is client-side.
 */
@UI("/rest-action")
@Title("REST Action Form")
@Getter
@Setter
public class RestActionForm {

  String zip = "28001";
  String street;
  String city;

  @Button
  @Label("Look up address")
  @RestAction(
      url = "/rest-action-demo.json?zip=${state.zip}",
      method = "GET",
      resultPath = "address",
      successMessage = "Address found")
  public void lookup() {}
}
