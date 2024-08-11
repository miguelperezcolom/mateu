package io.mateu.dtos;

import java.util.List;

public record Section(
    String id,
    String tabId,
    String caption,
    String description,
    boolean readOnly,
    SectionType type,
    String leftSideImageUrl,
    String topImageUrl,
    List<Action> actions,
    List<FieldGroup> fieldGroups) {}
