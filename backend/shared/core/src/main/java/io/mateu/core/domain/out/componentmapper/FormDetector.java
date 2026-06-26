package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.Header;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import java.lang.reflect.Modifier;

public final class FormDetector {

  public static boolean isForm(Object instance) {
    return instance instanceof Form || isForm(instance.getClass());
  }

  public static boolean isForm(Class<?> type) {
    // A class is a form if it has at least one editable data field.
    // @Button/@Toolbar methods are not required — a read-only / action-free form is still a form.
    return getAllFields(type).stream()
        .anyMatch(
            field ->
                !(MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Button.class)
                        || MetaAnnotations.isPresent(field, Toolbar.class))
                    && ((!Modifier.isFinal(field.getModifiers())
                            || field.getDeclaringClass().isRecord())
                        && !MetaAnnotations.isPresent(field, ReadOnly.class)
                        && !Component.class.isAssignableFrom(field.getType())
                        && !ComponentTreeSupplier.class.isAssignableFrom(field.getType())
                        && !MicroFrontend.class.isAssignableFrom(field.getType())
                        && !(String.class.equals(field.getType())
                            && MetaAnnotations.isPresent(field, Stereotype.class)
                            && field
                                .getAnnotation(Stereotype.class)
                                .value()
                                .equals(FieldStereotype.html))
                        && !MetaAnnotations.isPresent(field, KPI.class)
                        && !MetaAnnotations.isPresent(field, Menu.class)
                        && !MetaAnnotations.isPresent(field, Header.class)
                        && !MetaAnnotations.isPresent(field, Footer.class)
                        && !MetaAnnotations.isPresent(field, Avatar.class)
                        && !Status.class.isAssignableFrom(field.getType())));
  }
}
