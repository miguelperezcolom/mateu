package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

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
public record Form(
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
    List<Validation> validations,
    List<Rule> rules)
    implements ComponentMetadata {

  public Form {
    badges = Collections.unmodifiableList(badges);
    tabs = Collections.unmodifiableList(tabs);
    banners = Collections.unmodifiableList(banners);
    sections = Collections.unmodifiableList(sections);
    actions = Collections.unmodifiableList(actions);
    mainActions = Collections.unmodifiableList(mainActions);
    validations = Collections.unmodifiableList(validations);
    rules = Collections.unmodifiableList(rules);
  }

  @Override
  public List<Badge> badges() {
    return Collections.unmodifiableList(badges);
  }

  @Override
  public List<Tab> tabs() {
    return Collections.unmodifiableList(tabs);
  }

  @Override
  public List<Banner> banners() {
    return Collections.unmodifiableList(banners);
  }

  @Override
  public List<Section> sections() {
    return Collections.unmodifiableList(sections);
  }

  @Override
  public List<Action> actions() {
    return Collections.unmodifiableList(actions);
  }

  @Override
  public List<Action> mainActions() {
    return Collections.unmodifiableList(mainActions);
  }

  @Override
  public List<Validation> validations() {
    return Collections.unmodifiableList(validations);
  }

  @Override
  public List<Rule> rules() {
    return Collections.unmodifiableList(rules);
  }
}
