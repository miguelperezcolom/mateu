package io.mateu.dtos;

import java.util.Collections;
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
    implements ViewMetadata {

  public Form {
    badges = Collections.unmodifiableList(badges);
    tabs = Collections.unmodifiableList(tabs);
    banners = Collections.unmodifiableList(banners);
    sections = Collections.unmodifiableList(sections);
    actions = Collections.unmodifiableList(actions);
    mainActions = Collections.unmodifiableList(mainActions);
    validations = Collections.unmodifiableList(validations);
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
}
