package io.mateu.core.domain.uidefinitionlanguage.shared.annotations;

import java.lang.annotation.*;

/** Created by miguel on 18/1/17. */
@Repeatable(MainSearchFilters.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD) // can use in method only.
public @interface MainSearchFilter {

  String field() default "";
}
