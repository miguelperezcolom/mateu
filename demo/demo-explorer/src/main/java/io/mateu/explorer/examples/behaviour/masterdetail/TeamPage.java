package io.mateu.explorer.examples.behaviour.masterdetail;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;

/**
 * Master/detail with no shared state: the grid's {@code @OnRowSelected} method gets the clicked row
 * and emits {@code member-selected}; the detail is an independent island ({@link MemberCard}) that
 * subscribes to it and reloads ITSELF — the page and its grid are not re-rendered. {@code shortcut}
 * selects a row from the keyboard: Ctrl+Shift+1…9.
 */
@Title("Team")
public class TeamPage {

  public record Member(String id, String name, String role) {}

  @ReadOnly
  @Stereotype(FieldStereotype.grid)
  @OnRowSelected(value = "memberSelected", shortcut = "ctrl+shift")
  List<Member> team =
      Team.MEMBERS.stream().map(m -> new Member(m.id(), m.name(), m.role())).toList();

  Component detail = new MemberCard();

  Object memberSelected(Member member) {
    return UICommand.dispatchEvent("member-selected", Map.of("id", member.id()));
  }
}
