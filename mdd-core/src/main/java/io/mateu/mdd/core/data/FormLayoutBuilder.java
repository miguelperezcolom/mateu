package io.mateu.mdd.core.data;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilderParameters;

import java.util.List;

public interface FormLayoutBuilder {

    Pair<Component,AbstractStylist> build(MDDBinder binder, Class<?> aClass, Object v, List<Component> componentsToLookForErrors, FormLayoutBuilderParameters params);

}
