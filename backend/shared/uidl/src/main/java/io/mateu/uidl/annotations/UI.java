package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE}) // can use in method only.
@Documented
public @interface UI {

  String value();

  String indexHtmlPath() default "/static/_index.html";

  String frontendComponentPath() default "/assets/mateu.js";
}
