package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Form metadata
 *
 * @param icon This form icon
 * @param title This form title
 * @param readOnly If this form is read only
 * @param subtitle This form subtitle
 * @param status This form status. This has a special visual representation on top of the form
 * @param badges Badges to be shown for this form
 * @param tabs List of tabs used in this form
 * @param banners Banners to be shown in this form
 * @param sections Sections of this form. This is the container for teh fields
 * @param actions Actions for this form. To be shown at the top
 * @param mainActions Actions for this form. To be shown at the bottom
 * @param validations Client side validations for this form
 * @param rules Rules to be run after each value change
 */
public record FormDto(
    String icon,
    String title,
    boolean readOnly,
    String subtitle,
    StatusDto status,
    List<BadgeDto> badges,
    List<BannerDto> banners,
    List<SectionDto> sections,
    List<ActionDto> actions,
    List<ActionDto> mainActions,
    List<ValidationDto> validations,
    List<RuleDto> rules)
    implements ComponentMetadataDto {

  public FormDto {
    badges = Collections.unmodifiableList(badges);
    banners = Collections.unmodifiableList(banners);
    sections = Collections.unmodifiableList(sections);
    actions = Collections.unmodifiableList(actions);
    mainActions = Collections.unmodifiableList(mainActions);
    validations = Collections.unmodifiableList(validations);
    rules = Collections.unmodifiableList(rules);
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
  public List<SectionDto> sections() {
    return Collections.unmodifiableList(sections);
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
  public List<ValidationDto> validations() {
    return Collections.unmodifiableList(validations);
  }

  @Override
  public List<RuleDto> rules() {
    return Collections.unmodifiableList(rules);
  }

}
