package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.Header;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Menu;
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
    // A class is a form if it has at least one data field — editable or not: a view whose fields
    // are all @ReadOnly is a read-only form (labels, read-only widgets, a grid for a list of rows),
    // not a page of bare components. It used to be sent down the component path, where each value
    // was mapped by its class: the labels were lost and a grid became its rows' toString().
    // @Button/@Toolbar methods are not required — a read-only / action-free form is still a form.
    // A routed orchestrator field (an embedded crud / editable view, @Inline or @Subresource) is
    // rendered BY the form builder, as an island: a class holding one is a form even when its
    // other fields are all read-only. Left to the non-form path, the orchestrator was mapped as a
    // component in the HOST's route context and re-rendered the host inside itself, forever.
    if (getAllFields(type).stream()
        .anyMatch(
            field ->
                !Modifier.isStatic(field.getModifiers())
                    && EmbeddedOrchestratorFieldBuilder.isOrchestrator(field.getType()))) {
      return true;
    }
    return getAllFields(type).stream()
        .anyMatch(
            field ->
                !(MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Button.class)
                        || MetaAnnotations.isPresent(field, Toolbar.class))
                    && ((!Modifier.isFinal(field.getModifiers())
                            || field.getDeclaringClass().isRecord())
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
