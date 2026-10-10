package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Meant to name the type argument of a generic field hidden by erasure.
 *
 * @deprecated nothing reads it: Mateu resolves type arguments from the declared generic type.
 *     Declare the field with its type argument instead (e.g. {@code List<MyDto> items}).
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE})
public @interface GenericClass {
  Class clazz();
}
