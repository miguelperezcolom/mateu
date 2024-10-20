package io.mateu.core.domain.uidefinition.shared.annotations;

import io.mateu.core.domain.uidefinition.shared.data.ItemsListProvider;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER}) // can use in method only.
public @interface ItemsProvider {

  Class<? extends ItemsListProvider> value();
}
