package io.mateu.mdd.demofrontoffice.domain.stay;

import org.springframework.data.relational.core.mapping.Table;

/**
 * A person accompanying the stay's main guest. Value object owned by {@link Stay}. Carries its own
 * identity data (document + contact) so every pax of the reservation can be registered at the desk
 * — the main guest's identity lives in the Guest aggregate instead.
 */
@Table("stay_companion")
public record Companion(
    String companionId,
    String name,
    String document,
    boolean documentVerified,
    String email,
    String phone,
    String description) {

  public Companion(String companionId, String name, String description) {
    this(companionId, name, null, false, null, null, description);
  }

  /** A pax slot of the reservation nobody has registered yet. */
  public static Companion pending(int paxNumber) {
    return new Companion("pax-" + paxNumber, "Huésped " + paxNumber, "Pendiente de registro");
  }

  /** Whether the desk already holds this companion's identity. */
  public boolean identityComplete() {
    return document != null && !document.isBlank() && documentVerified;
  }

  /** Records a verified identity document (check-in identity step). */
  public Companion verifyIdentity(String document) {
    if (document == null || document.isBlank())
      throw new IllegalArgumentException("A document is required to verify identity");
    return new Companion(companionId, name, document, true, email, phone, description);
  }

  /** Updates the contact data captured at the desk. */
  public Companion updateContact(String email, String phone) {
    return new Companion(companionId, name, document, documentVerified, email, phone, description);
  }
}
