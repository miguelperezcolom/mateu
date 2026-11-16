package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import lombok.Builder;

/** A column of an {@link ActionPanel}: a title and its actions. */
@Builder
@Experimental("action panel (since 3.0)")
public record ActionPanelCategory(String title, List<ActionPanelItem> actions) {}
