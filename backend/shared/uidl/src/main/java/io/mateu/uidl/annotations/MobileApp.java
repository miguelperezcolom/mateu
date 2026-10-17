package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * How this UI presents itself to the Mateu mobile app — the values of its manifest, {@code GET
 * <baseUrl>/mateu/v3/manifest}, which the app reads when a UI is added (by QR, see {@link
 * App#mobileQr()}) and again later, so a rename or a new icon reaches every phone without
 * re-scanning.
 *
 * <p>Every attribute is optional; blank means "derive it": the name from {@code @Title} (else the
 * class name), the icon from {@code @Logo} (else {@code @FavIcon}), the theme colour from
 * {@code @App(accentColor)}. A setting wins over the annotation — a JVM system property or the
 * environment variable it names ({@code mateu.mobile.oidc.issuer} / {@code
 * MATEU_MOBILE_OIDC_ISSUER}) — which is where per-environment values such as the identity provider
 * belong.
 *
 * <p>{@code oidcIssuer} + {@code oidcClientId} only TELL the app which OpenID Connect provider the
 * host application trusts, so it can sign the user in (Authorization Code + PKCE) and send the
 * bearer token. Mateu validates nothing: the application's framework does, as for any other client.
 * Without both, the manifest carries no {@code auth} and the UI is opened without signing in.
 */
@Experimental("mobile app (3.0 beta)")
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Documented
public @interface MobileApp {

  /** The name shown in the app's list. Setting {@code mateu.mobile.name}. */
  String name() default "";

  /**
   * A short name for tight spots (defaults to the name). Setting {@code mateu.mobile.short-name}.
   */
  String shortName() default "";

  /**
   * The icon: an absolute URL, a data URI, or a path relative to the UI's origin (resolved by the
   * app against the manifest URL). Setting {@code mateu.mobile.icon}.
   */
  String icon() default "";

  /**
   * A CSS hex colour for the app's chrome around this UI. Setting {@code mateu.mobile.theme-color}.
   */
  String themeColor() default "";

  /**
   * The oldest Mateu app that can render this UI; an older one shows "Update the app". Default
   * {@code 1.0.0}. Setting {@code mateu.mobile.min-app-version}.
   */
  String minAppVersion() default "";

  /** The OpenID Connect issuer the host app trusts. Setting {@code mateu.mobile.oidc.issuer}. */
  String oidcIssuer() default "";

  /**
   * The OIDC client id of the mobile app at that issuer. Setting {@code
   * mateu.mobile.oidc.client-id}.
   */
  String oidcClientId() default "";

  /**
   * The scopes to ask for (default {@code openid profile}). Setting {@code
   * mateu.mobile.oidc.scopes}, comma- or space-separated.
   */
  String[] scopes() default {};
}
