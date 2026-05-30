package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Message;

@Route(value = "/page4", parentRoute = "/home2")
@AutoSave
public class Page4 {

    String name = "Mateu";

    Object save() {
        return Message.success("Saved");
    }

}
