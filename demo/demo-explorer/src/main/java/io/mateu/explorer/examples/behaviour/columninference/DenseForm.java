package io.mateu.explorer.examples.behaviour.columninference;

import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Title;

/**
 * A DECLARED single column with six or more short-labelled, single-line fields: the labels move
 * ASIDE (left of the field) — the dense back-office idiom. {@code labelsAside = ASIDE | TOP} on
 * {@code @FormLayout} forces either; {@code AUTO} (the default) infers it.
 */
@Title("Dense form — labels aside")
@FormLayout(columns = 1)
public class DenseForm {
  String name;
  String email;
  String phone;
  String company;
  String city;
  String country;
}
