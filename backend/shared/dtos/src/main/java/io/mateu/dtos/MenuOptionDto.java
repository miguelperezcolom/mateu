package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder
public record MenuOptionDto(
    MenuTypeDto type,
    String icon,
    String label,
    ComponentDto component,
    String path,
    String actionId,
    List<MenuOptionDto> submenus,
    @JsonIgnore int order,
    boolean visible,
    boolean selected,
    boolean disabled,
    boolean disabledOnClick,
    String className,
    Object itemData,
    boolean separator,
    boolean remote,
    String baseUrl,
    String route,
    String consumedRoute,
    String serverSideType,
    Map<String, Object> params,
    boolean explode,
    String uriPrefix,
    String description,
    List<RuleDto> rules,
    // A remote section only (remote = true): the route prefix the remote's screens live under, as
    // far as the shell can tell before the remote answers (its mount path, without the groups the
    // shell nests it in). Lets the renderer know the active section and the first breadcrumb on a
    // cold load, and pick the remote for a route by longest prefix.
    String routePrefix,
    // A remote section only: true when the shell DECLARED the label (@Label or withLabel), which
    // then wins over the one the remote answers with. False when the label shown is only the
    // field name filled in by Mateu: the remote's own label replaces it, as it always did.
    boolean shellLabel,
    // The entry opens a listing: how to narrow it from its URL (declared filters, the free-text
    // search and the reserved id-set filter). Null for any other screen.
    ListingDescriptorDto listing,
    // A GROUP that opens as a panel of cards ("cards") instead of the usual list (null). Its
    // entries are the cards: label = title, description = text, icon / image, and each entry's
    // own submenus = the card's actions.
    String display,
    // The image of an entry shown as a card (a URL or a data URI); null for none.
    String image) {

  public MenuOptionDto {
    submenus = Collections.unmodifiableList(submenus != null ? submenus : Collections.emptyList());
    rules = Collections.unmodifiableList(rules != null ? rules : Collections.emptyList());
  }

  @Override
  public List<MenuOptionDto> submenus() {
    return Collections.unmodifiableList(submenus);
  }
}
