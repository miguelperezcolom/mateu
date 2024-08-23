package io.mateu.core.domain.uidefinition.core.interfaces;

import java.util.List;

public record Card(
        CardLayout layout,
        String thumbnail,
        String headerText,
        String subhead,
        String media,
        String supportingText,
        List<Button> buttons,
        List<Icon> icons
) {}
