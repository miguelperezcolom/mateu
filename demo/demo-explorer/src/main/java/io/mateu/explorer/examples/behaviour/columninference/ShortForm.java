package io.mateu.explorer.examples.behaviour.columninference;

import io.mateu.uidl.annotations.Title;

/** Five visible fields and no declared count: ONE column. */
@Title("Short form — 5 fields")
public class ShortForm {
  String name;
  String email;
  String phone;
  String company;
  String city;
}
