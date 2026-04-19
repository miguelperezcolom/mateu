package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;

@UI("/simple")
@Style(StyleConstants.CONTAINER)
public class SimplePage {

    String name;

    @Button
    void greet() {}

}