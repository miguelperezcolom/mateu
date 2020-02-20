package io.mateu.mdd.vaadinport.vaadin.util;

import com.vaadin.ui.Window;
import io.mateu.mdd.core.data.MDDBinder;

public abstract class BindedWindow extends Window {

    public BindedWindow(String caption) {
        super(caption);
    }

    public abstract MDDBinder getBinder();

}
