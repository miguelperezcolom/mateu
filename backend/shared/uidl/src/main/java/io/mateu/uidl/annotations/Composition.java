package io.mateu.uidl.annotations;

import io.mateu.uidl.interfaces.CompositionCrudStore;
import io.mateu.uidl.interfaces.Named;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Composition {

  Class<? extends Named> targetClass();

  // Element name kept for source compatibility (renaming an annotation element is breaking with no
  // deprecation bridge); the bound is a CompositionCrudStore so new stores are accepted too.
  Class<? extends CompositionCrudStore> repositoryClass();

  String foreignKeyField();
}
