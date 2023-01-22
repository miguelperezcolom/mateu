package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.server.SerializablePredicate;
import com.vaadin.server.Sizeable;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class MongoObjectFieldBuilder extends JPATextAreaFieldBuilder {

    ObjectMapper objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);;


    public boolean isSupported(FieldInterfaced field) {
        return Object.class.equals(field.getType())
                && field.getDeclaringClass().isAnnotationPresent(Document.class);
    }

    @Override
    protected boolean validateOnChange() {
        return false;
    }

    @Override
    protected void bind(MDDBinder binder, com.vaadin.ui.TextArea tf, FieldInterfaced field, boolean forSearchFilter) {
        Binder.BindingBuilder aux = binder.forField(tf).withConverter(new Converter() {
            @Override
            public Result convertToModel(Object o, ValueContext valueContext) {
                Object u = null;
                try {
                    if (!Strings.isNullOrEmpty((String) o)) u =
                            objectMapper.readValue((String) o, Object.class);
                } catch (Exception e) {
                    //Notifier.alert(e);
                    return Result.error(e.getMessage());
                }
                return Result.ok(u);
            }

            @Override
            public Object convertToPresentation(Object s, ValueContext valueContext) {
                String o = null;
                try {
                    if (valueContext.getHasValue().isPresent() && !Strings.isNullOrEmpty((String) valueContext.getHasValue().get().getValue())) return valueContext.getHasValue().get().getValue();
                    if (s != null) o = objectMapper.writeValueAsString(s);
                    else o = "";
                } catch (IOException e) {
                    //Notifier.alert(e);
                    return Result.error(e.getMessage());
                }
                return o;
            }
        });
        if (!forSearchFilter && field.getDeclaringClass() != null) aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getId());
    }



}
