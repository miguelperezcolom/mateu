package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/** A column of an {@link ActionPanel}: a title and its actions. */
@Builder
public record ActionPanelCategory(String title, List<ActionPanelItem> actions) {}
