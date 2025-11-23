package io.mateu.uidl.reflection;

import io.mateu.uidl.fluent.Component;
import java.util.Collection;

public interface ComponentMapper {

  Collection<? extends Component> mapToComponents(Object object);
}
