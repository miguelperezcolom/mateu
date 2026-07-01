package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a field (or, at class level, the whole view) <b>read-only unless</b> the current user
 * matches at least one of the declared identity dimensions.
 *
 * <p>The matching is identical to {@link EyesOnly}: the token must satisfy each dimension that is
 * actually declared (AND across declared dimensions, OR within each), resolved from the JWT Bearer
 * token by {@code Authorizer}. If no dimension is declared the annotation never applies (the field
 * stays editable). If there is no token / no request, the user is treated as not matching, so the
 * field becomes read-only.
 *
 * <p>Composes with {@link EyesOnly} for layered access: e.g. {@code @EyesOnly(roles="staff")} +
 * {@code @ReadOnlyUnless(roles="manager")} hides the field from non-staff, shows it read-only to
 * staff, and editable to managers.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface ReadOnlyUnless {
  String[] roles() default {};

  String[] groups() default {};

  String[] scopes() default {};

  String[] permissions() default {};
}
