package io.mateu.demo.appdefinition;

import io.mateu.uidl.annotations.Action;

/**
 * A plain form view model bound to a route by DATA (no {@code @UI}) — {@code routes.yaml} maps the
 * {@code customer} route to this class as its {@code viewModel}, and to a page {@code definition} that
 * lays out its fields. It exists so the visual editor's data-source binding picker has a data source
 * with real fields and actions to bind against: its {@code __contract__} exposes name/email/age/
 * subscribed and the {@code save} action.
 */
public class CustomerForm {

  private String name;
  private String email;
  private Integer age;
  private boolean subscribed;

  @Action
  public void save() {
    // A demo action: nothing to persist — the point is that `save` shows up in the contract.
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Integer getAge() {
    return age;
  }

  public void setAge(Integer age) {
    this.age = age;
  }

  public boolean isSubscribed() {
    return subscribed;
  }

  public void setSubscribed(boolean subscribed) {
    this.subscribed = subscribed;
  }
}
