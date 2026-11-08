package io.mateu.explorer.examples.behaviour.columninference;

import io.mateu.uidl.annotations.Title;

/** Eight visible fields and no declared count: TWO columns (from 7 on). */
@Title("Long form — 8 fields")
public class LongForm {
  String name;
  String email;
  String phone;
  String company;
  String street;
  String city;
  String postcode;
  String country;
}
