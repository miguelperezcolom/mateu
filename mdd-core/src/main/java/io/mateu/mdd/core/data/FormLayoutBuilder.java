package io.mateu.mdd.core.data;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.data.Pair;

import java.util.List;
import java.util.Map;

public interface FormLayoutBuilder {

    Pair<Component,AbstractStylist> build(MDDBinder binder, Class<?> aClass, Object v, Map<HasValue,List<Validator>> validators, List<FieldInterfaced> allEditableFields);

}
