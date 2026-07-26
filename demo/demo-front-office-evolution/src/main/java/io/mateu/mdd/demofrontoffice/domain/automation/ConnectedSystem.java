package io.mateu.mdd.demofrontoffice.domain.automation;

import org.springframework.data.relational.core.mapping.Table;

/** An external system the automation talks to (OHIP, Voxel, CRS…). Value object. */
@Table("automation_system")
public record ConnectedSystem(String name) {}
