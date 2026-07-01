package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a field <b>disabled unless</b> the current user matches at least one of the declared
 * identity dimensions.
 *
 * <p>The matching is identical to {@link EyesOnly}: the token must satisfy each dimension that is
 * actually declared (AND across declared dimensions, OR within each), resolved from the JWT Bearer
 * token by {@code Authorizer}. If no dimension is declared the annotation never applies. If there
 * is no token / no request, the user is treated as not matching, so the field becomes disabled.
 *
 * <p>Disabled state is carried as a client-side rule (like {@link Disabled}); the authorization
 * itself is decided server-side at render time.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
public @interface DisabledUnless {
  String[] roles() default {};

  String[] groups() default {};

  String[] scopes() default {};

  String[] permissions() default {};
}
