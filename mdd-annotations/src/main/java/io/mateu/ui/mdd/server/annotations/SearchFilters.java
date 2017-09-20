package io.mateu.ui.mdd.server.annotations;

import java.lang.annotation.*;

/**
 * Created by miguel on 11/4/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface SearchFilters {

    SearchFilter[] value();

}
