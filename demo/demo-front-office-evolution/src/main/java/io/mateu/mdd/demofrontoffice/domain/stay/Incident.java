package io.mateu.mdd.demofrontoffice.domain.stay;

import org.springframework.data.relational.core.mapping.Table;

/**
 * An incident reported during the stay (maintenance issue, service delay, active complaint…).
 * Value object owned by {@link Stay}; {@code complaint} flags formal guest complaints.
 */
@Table("stay_incident")
public record Incident(
    String code,
    String icon,
    String title,
    String description,
    IncidentStatus status,
    boolean complaint) {

  public Incident resolve() {
    return new Incident(code, icon, title, description, IncidentStatus.RESOLVED, complaint);
  }
}
