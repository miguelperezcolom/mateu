package com.example.demo.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;

@UI("")
@Style(StyleConstants.CONTAINER)
public class Home {

    @ReadOnly
    int count = 0;

    @Button
    Runnable increment = () -> count++;

}
