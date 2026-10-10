package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import lombok.Builder;

/** A column of an {@link ActionPanel}: a title and its actions. */
@Builder
@Experimental("action panel (3.0-alpha.409)")
public record ActionPanelCategory(String title, List<ActionPanelItem> actions) {}
