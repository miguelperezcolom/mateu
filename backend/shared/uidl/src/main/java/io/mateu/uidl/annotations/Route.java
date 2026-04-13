package io.mateu.uidl.annotations;

import io.mateu.uidl.RouteConstants;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Routes.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Route {

  String value();

  String[] uis() default {};

  String parentRoute() default RouteConstants.NO_PARENT_ROUTE;
}
