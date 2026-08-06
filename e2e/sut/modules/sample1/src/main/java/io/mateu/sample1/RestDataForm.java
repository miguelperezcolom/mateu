package io.mateu.sample1;

import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

/**
 * A screen whose initial data is fetched CLIENT-SIDE from a REST endpoint on entry. On load the
 * renderer fetches a same-origin JSON ({@code static/rest-data-demo.json} =
 * {@code {"profile": {"name": ..., "email": ...}}}); {@code resultPath="profile"} merges
 * {@code {name, email}} into the form state, so the fields arrive populated — no server round-trip.
 */
@UI("/rest-data")
@Title("REST Data Form")
@RestData(url = "/rest-data-demo.json", resultPath = "profile")
@Getter
@Setter
public class RestDataForm {

  String name;
  String email;
}
