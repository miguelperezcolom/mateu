package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.FormTemplate;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

/**
 * Redwood's Item overview page template (Spectra {@code oj-sp-item-overview-page}): the item's
 * overview panel beside the page's main area. Its fields are those of the panel ({@code
 * oj-sp-item-overview}): an {@code avatar} (round, from an image or initials) or a {@code photo}
 * (4:3), and its two slots, {@code body} and {@code footer}. The rest comes from the {@link
 * io.mateu.uidl.fluent.Form} that carries it — its title and subtitle are the item's, its first
 * badge the item's badge, its toolbar the item's actions, its peer navigation the previous/next
 * item — and the form's {@code content} is the template's {@code main} slot (typically a tab bar).
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record ItemOverviewPage(
    TemplateImage avatar,
    TemplateImage photo,
    @Singular("bodyItem") List<Component> body,
    @Singular("footerItem") List<Component> footer)
    implements FormTemplate {

  public ItemOverviewPage {
    body = body != null ? body : Collections.emptyList();
    footer = footer != null ? footer : Collections.emptyList();
  }
}
