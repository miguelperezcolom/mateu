package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.UICommand;
import java.util.List;

public interface CommandSupplier {

  List<UICommand> commands(HttpRequest httpRequest);
}
