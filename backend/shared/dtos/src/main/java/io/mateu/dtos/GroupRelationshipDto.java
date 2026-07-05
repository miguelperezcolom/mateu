package io.mateu.dtos;

/**
 * Semantic relationship between the groups a disclosure layout (tabs, accordion, wizard…) presents.
 * Carried next to the concrete widget so renderers can adapt the presentation without losing the
 * intent.
 */
public enum GroupRelationshipDto {
  alternative,
  sequential,
  simultaneous
}
