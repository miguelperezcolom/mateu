package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * On a field of POJO type, expands that type's fields inline into the parent section. The parent
 * field's {@link Section} annotation provides the section header; no Card wrapper is added around
 * the expanded content. Annotate the POJO type with {@link PlainText} and/or {@link Compact} as
 * needed — those class-level annotations are not inherited from the enclosing form.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Inline {}
