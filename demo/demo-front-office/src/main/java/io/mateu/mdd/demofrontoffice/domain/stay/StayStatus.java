package io.mateu.mdd.demofrontoffice.domain.stay;

/** Lifecycle of a stay: expected today → checked in → checked out. */
public enum StayStatus {
  ARRIVING,
  IN_HOUSE,
  DEPARTED
}
