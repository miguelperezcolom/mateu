package io.mateu.mdd.demofrontoffice.domain.folio;

import java.math.BigDecimal;
import org.springframework.data.relational.core.mapping.Table;

/**
 * A charge (or discount, when negative) posted to a folio. {@code included} lines belong to the
 * contracted package and carry no amount. Value object owned by {@link Folio}.
 */
@Table("folio_line")
public record FolioLine(String concept, BigDecimal amount, boolean included, String includedLabel) {

  public static FolioLine charge(String concept, BigDecimal amount) {
    return new FolioLine(concept, amount, false, null);
  }

  public static FolioLine includedInPackage(String concept, String label) {
    return new FolioLine(concept, null, true, label);
  }
}
