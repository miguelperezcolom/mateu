package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * Form metadata
 *
 * @param icon This form icon
 * @param title This form title
 * @param readOnly If this form is read only
 * @param subtitle This form subtitle
 * @param status This form status. This has a special visual representation on top of the form
 * @param badges Badges to be shown for this form
 * @param banners Banners to be shown in this form
 * @param actions Actions for this form. To be shown at the top
 * @param mainActions Actions for this form. To be shown at the bottom
 * @param rules Rules to be run after each initialValue change
 */
@Builder
public record PageDto(
    String icon,
    String title,
    boolean readOnly,
    String subtitle,
    StatusDto status,
    List<BadgeDto> badges,
    List<BannerDto> banners,
    List<ActionDto> actions,
    List<ActionDto> mainActions,
    List<RuleDto> rules)
    implements ComponentMetadataDto {

  public PageDto {
    badges = Collections.unmodifiableList(badges != null ? badges : Collections.emptyList());
    banners = Collections.unmodifiableList(banners != null ? banners : Collections.emptyList());
    actions = Collections.unmodifiableList(actions != null ? actions : Collections.emptyList());
    mainActions =
        Collections.unmodifiableList(mainActions != null ? mainActions : Collections.emptyList());
    rules = Collections.unmodifiableList(rules != null ? rules : Collections.emptyList());
  }

  @Override
  public List<BadgeDto> badges() {
    return Collections.unmodifiableList(badges);
  }

  @Override
  public List<BannerDto> banners() {
    return Collections.unmodifiableList(banners);
  }

  @Override
  public List<ActionDto> actions() {
    return Collections.unmodifiableList(actions);
  }

  @Override
  public List<ActionDto> mainActions() {
    return Collections.unmodifiableList(mainActions);
  }

  @Override
  public List<RuleDto> rules() {
    return Collections.unmodifiableList(rules);
  }
}
