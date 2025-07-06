package io.mateu.uidl.fluent;

import io.mateu.uidl.data.Column;
import io.mateu.uidl.data.Field;
import java.util.List;
import lombok.Builder;

@Builder
public record Crudl(
    String id,
    String favicon,
    String pageTitle,
    String title,
    String subtitle,
    List<Action> actions,
    List<Trigger> triggers,
    List<UserTrigger> toolbar,
    List<Column> columns,
    boolean searchable,
    List<Field> filters)
    implements Component {

  @Override
  public List<Action> actions() {
    return actions != null ? actions : List.of();
  }

  @Override
  public List<Trigger> triggers() {
    return triggers != null ? triggers : List.of();
  }

  @Override
  public List<UserTrigger> toolbar() {
    return toolbar != null ? toolbar : List.of();
  }

  @Override
  public List<Column> columns() {
    return columns != null ? columns : List.of();
  }
}
