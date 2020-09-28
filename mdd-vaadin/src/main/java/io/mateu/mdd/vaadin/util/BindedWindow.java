package io.mateu.mdd.vaadin.util;

import com.vaadin.ui.Window;
import io.mateu.mdd.vaadin.data.MDDBinder;

public abstract class BindedWindow extends Window {

    public BindedWindow(String caption) {
        super(caption);
    }

    public abstract MDDBinder getBinder();

}
