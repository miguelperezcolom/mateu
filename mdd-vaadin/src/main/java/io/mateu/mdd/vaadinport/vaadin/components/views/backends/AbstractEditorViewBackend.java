package io.mateu.mdd.vaadinport.vaadin.components.views.backends;

import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;

import java.util.List;

public abstract class AbstractEditorViewBackend {

    public abstract List<Component> getFields(MDDBinder binder);

    public abstract void save();

    public abstract void load();

    public abstract List<Button> getActions();

}
