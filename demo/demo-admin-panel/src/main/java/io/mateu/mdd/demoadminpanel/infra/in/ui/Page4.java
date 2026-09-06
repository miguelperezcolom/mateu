package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.data.Message;

@AutoSave
@Style(StyleConstants.CONTAINER)
public class Page4 {

    String name = "Mateu";

    Object save() {
        return Message.success("Saved");
    }

}
