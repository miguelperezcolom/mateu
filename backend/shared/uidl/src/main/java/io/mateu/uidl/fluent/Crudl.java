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
    implements Component {}
