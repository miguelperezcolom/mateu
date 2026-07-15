package io.mateu.mdd.demofrontoffice.domain.folio;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.MappedCollection;

/**
 * Folio aggregate root — the guest account of a stay: the charges posted during the stay and the
 * card pre-authorization taken at check-in. Referenced to the stay by {@code stayId}; the balance
 * is always derived from the lines, never stored.
 */
public record Folio(
    @Id String id,
    String stayId,
    BigDecimal preauthorized,
    @MappedCollection(idColumn = "folio_id", keyColumn = "idx") List<FolioLine> lines) {

  public Folio {
    if (id == null || id.isBlank()) throw new IllegalArgumentException("Folio id is required");
    if (stayId == null || stayId.isBlank())
      throw new IllegalArgumentException("A folio belongs to a stay");
    lines = lines == null ? List.of() : List.copyOf(lines);
  }

  public static Folio openFor(String id, String stayId, BigDecimal preauthorized) {
    return new Folio(id, stayId, preauthorized, List.of());
  }

  /** Outstanding balance: the sum of all line amounts (included lines count as zero). */
  public BigDecimal balance() {
    return lines.stream()
        .map(FolioLine::amount)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  /** Whether the pre-authorization taken at check-in covers the current balance. */
  public boolean coveredByPreauthorization() {
    return preauthorized != null && balance().compareTo(preauthorized) <= 0;
  }

  public Folio post(FolioLine line) {
    List<FolioLine> updated = new ArrayList<>(lines);
    updated.add(line);
    return new Folio(id, stayId, preauthorized, updated);
  }
}
