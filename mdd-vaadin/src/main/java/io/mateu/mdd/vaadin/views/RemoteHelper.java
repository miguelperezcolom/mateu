package io.mateu.mdd.vaadin.views;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MDDOpenRemoteFormAction;
import io.mateu.mdd.shared.interfaces.RemoteForm;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.remote.RemoteViewReader;
import io.mateu.reflection.FieldInterfacedFromField;
import io.mateu.reflection.FieldInterfacedFromRemoteField;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

public class RemoteHelper {
    public static Object createBean(RemoteForm remoteForm) throws Exception {

        View view = new RemoteViewReader().read(remoteForm);

        String targetClassName = getTargetClassName(remoteForm);


        Object instance = null;
        try {
            Class type = ReflectionHelper.createClass(
                    MDD.getClassPool(),
                    MDDBinder.class,
                    MDD.getClassPool().getClassLoader(),
                    targetClassName,
                    getFields(view), false);

            instance = ReflectionHelper.newInstance(type);
        } catch (Exception e) {
            e.printStackTrace();
            Notifier.alert(e);
        }


        return instance;
    }

    private static List<FieldInterfaced> getFields(View view) {
        List<FieldInterfaced> fields = new ArrayList<>();
        if (view.getMetadata() instanceof Form) {
            Form form = (Form) view.getMetadata();
            for (Section section : form.getSections()) {
                for (FieldGroup fieldGroup : section.getFieldGroups()) {
                    for (Field field : fieldGroup.getFields()) {
                        fields.add(new FieldInterfacedFromRemoteField(field));
                    }
                }
            }
        }
        return fields;
    }

    private static String getTargetClassName(RemoteForm remoteForm) {
        return "" + normalize(remoteForm.getBaseUrl())
                + "_" + remoteForm.getClassName() + "_Remote000";
    }

    private static String normalize(String url) {
        return Helper.capitalize(url.replaceAll("\\:", "_").replaceAll("\\/", "_").replaceAll("\\.", "_"));
    }
}
