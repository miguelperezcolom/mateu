package io.mateu.uidl.annotations;

import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppVariant;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface App {
  AppVariant value() default AppVariant.AUTO;

  AppLayout layout() default AppLayout.SINGLE_SLOT;

  boolean themeToggle() default false;
}
