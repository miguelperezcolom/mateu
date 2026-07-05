package io.mateu.uidl.data;

/**
 * Semantic relationship between the groups of information a disclosure layout (tabs, accordion,
 * wizard…) presents. It travels on the wire next to the concrete widget so renderers can adapt the
 * presentation (e.g. tabs on desktop, accordion on mobile) without losing the intent.
 */
public enum GroupRelationship {
  /** Independent groups the user visits in any order; only one needs to be visible at a time. */
  alternative,
  /** Groups that build on each other and are meant to be completed in order. */
  sequential,
  /** Groups meant to be visible at the same time. */
  simultaneous
}
