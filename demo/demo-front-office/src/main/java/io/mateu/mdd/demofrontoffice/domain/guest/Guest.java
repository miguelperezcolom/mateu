package io.mateu.mdd.demofrontoffice.domain.guest;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.MappedCollection;

/**
 * Guest aggregate root — the hotel's cardex: identity, contact data, loyalty standing and
 * preferences. Stays reference guests by id; a guest exists independently of any stay.
 */
public record Guest(
    @Id String id,
    String name,
    String document,
    boolean documentVerified,
    String email,
    String phone,
    GuestTier tier,
    int loyaltyPoints,
    int stays,
    int nights,
    int yearsAsClient,
    int complaints,
    int hotels,
    String lastStaySummary,
    String lastStayComplementaryInfo,
    @MappedCollection(idColumn = "guest_id", keyColumn = "idx") List<Preference> preferences) {

  public Guest {
    if (id == null || id.isBlank()) throw new IllegalArgumentException("Guest id is required");
    if (name == null || name.isBlank()) throw new IllegalArgumentException("Guest name is required");
    preferences = preferences == null ? List.of() : List.copyOf(preferences);
  }

  /** Whether the front desk can skip the identity step of the check-in. */
  public boolean identityComplete() {
    return document != null && !document.isBlank() && documentVerified;
  }

  /** Records a verified identity document (check-in identity step). */
  public Guest verifyIdentity(String document) {
    if (document == null || document.isBlank())
      throw new IllegalArgumentException("A document is required to verify identity");
    return new Guest(
        id, name, document, true, email, phone, tier, loyaltyPoints, stays, nights, yearsAsClient,
        complaints, hotels, lastStaySummary, lastStayComplementaryInfo, preferences);
  }

  /** Updates the contact data captured at the desk. */
  public Guest updateContact(String email, String phone) {
    return new Guest(
        id, name, document, documentVerified, email, phone, tier, loyaltyPoints, stays, nights,
        yearsAsClient, complaints, hotels, lastStaySummary, lastStayComplementaryInfo, preferences);
  }

  /** Adds a preference to the cardex if not already present. */
  public Guest addPreference(String text) {
    if (preferences.stream().anyMatch(p -> p.text().equalsIgnoreCase(text))) return this;
    List<Preference> updated = new ArrayList<>(preferences);
    updated.add(new Preference(text));
    return new Guest(
        id, name, document, documentVerified, email, phone, tier, loyaltyPoints, stays, nights,
        yearsAsClient, complaints, hotels, lastStaySummary, lastStayComplementaryInfo, updated);
  }
}
