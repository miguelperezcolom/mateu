package io.mateu.uidl.annotations;

import io.mateu.uidl.interfaces.CompositionCrudRepository;
import io.mateu.uidl.interfaces.SimpleEntity;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Composition {

  Class<? extends SimpleEntity> targetClass();

  Class<? extends CompositionCrudRepository> repositoryClass();

  String foreignKeyField();
}
