package io.mateu.dtos;

import java.util.List;

public record Form(
    String dataPrefix,
    String icon,
    String title,
    boolean readOnly,
    String subtitle,
    Status status,
    List<Badge> badges,
    List<Tab> tabs,
    List<Banner> banners,
    List<Section> sections,
    List<Action> actions,
    List<Action> mainActions,
    List<Validation> validations)
    implements ViewMetadata {}
