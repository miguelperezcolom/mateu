package io.mateu.uidl.annotations;

import io.mateu.uidl.data.BannerTheme;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Banner {

  BannerTheme theme() default BannerTheme.INFO;

  String title() default "";

  boolean closeable() default false;

  int timeoutSeconds() default 0;
}
