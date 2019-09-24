package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders;

import com.google.common.base.Strings;
import com.vaadin.data.*;
import com.vaadin.data.provider.DataProvider;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.UserError;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.UseIdToSelect;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.annotations.UseRadioButtons;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.persistence.Entity;
import javax.persistence.OneToOne;
import javax.persistence.Query;
import javax.validation.constraints.NotNull;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JPAOneToOneFieldBuilder extends JPAManyToOneFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return field.isAnnotationPresent(OneToOne.class);
    }

}
