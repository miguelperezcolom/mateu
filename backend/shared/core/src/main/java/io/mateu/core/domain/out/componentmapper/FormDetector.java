package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

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
    if (instance instanceof Form) {
      return true;
    }
    return (getAllFields(instance.getClass()).stream()
                .anyMatch(
                    field ->
                        field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                            || field.isAnnotationPresent(Toolbar.class))
            || getAllMethods(instance.getClass()).stream()
                .anyMatch(
                    method ->
                        method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                            || method.isAnnotationPresent(Toolbar.class)))
        && getAllFields(instance.getClass()).stream()
            .anyMatch(
                field ->
                    !(field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                            || field.isAnnotationPresent(Toolbar.class))
                        && (!Modifier.isFinal(field.getModifiers())
                            && !field.isAnnotationPresent(ReadOnly.class)
                            && !Component.class.isAssignableFrom(field.getType())
                            && !ComponentTreeSupplier.class.isAssignableFrom(field.getType())
                            && !MicroFrontend.class.isAssignableFrom(field.getType())
                            && !(String.class.equals(field.getType())
                                && field.isAnnotationPresent(Stereotype.class)
                                && field
                                    .getAnnotation(Stereotype.class)
                                    .value()
                                    .equals(FieldStereotype.html))
                            && !field.isAnnotationPresent(KPI.class)
                            && !field.isAnnotationPresent(Menu.class)
                            && !field.isAnnotationPresent(Header.class)
                            && !field.isAnnotationPresent(Footer.class)
                            && !field.isAnnotationPresent(Avatar.class)
                            && !Status.class.isAssignableFrom(field.getType())));
  }
}
