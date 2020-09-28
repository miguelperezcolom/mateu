package io.mateu.mdd.shared.data;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.vaadinport.vaadin.components.views.FormLayoutBuilderParameters;
import io.mateu.util.data.Pair;

import java.util.List;
import java.util.Map;

public interface FormLayoutBuilder {

    Pair<Component,AbstractStylist> build(MDDBinder binder, Class<?> aClass, Object v, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params, Map<String, List<AbstractAction>> attachedActions);

}
