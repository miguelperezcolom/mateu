package io.mateu.mdd.demofrontoffice.domain.stay;

import java.time.LocalDateTime;
import org.springframework.data.relational.core.mapping.Table;

/**
 * An incident reported during the stay (maintenance issue, service delay, active complaint...).
 * Value object owned by {@link Stay}; {@code complaint} flags formal guest complaints. The
 * {@code description} is the OPENING comment; {@code openedAt}/{@code resolvedAt} anchor the
 * incident's little timeline.
 */
@Table("stay_incident")
public record Incident(
    String code,
    String icon,
    String title,
    String description,
    IncidentStatus status,
    boolean complaint,
    LocalDateTime openedAt,
    LocalDateTime resolvedAt) {

  public Incident resolve() {
    return new Incident(
        code, icon, title, description, IncidentStatus.RESOLVED, complaint, openedAt,
        LocalDateTime.now());
  }
}
