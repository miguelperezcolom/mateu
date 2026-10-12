package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

/** The page {@link NonRootMenuApp}'s route-typed entry names (a route inside its mount). */
@UI("/e2-demo/routed-page")
@Title("Routed page")
@Getter
@Setter
public class NonRootRoutedPage {

  String note = "reached through a route-typed menu entry";
}
