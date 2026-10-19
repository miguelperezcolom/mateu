package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Makes the generated index page log the user in against a Keycloak server (keycloak-js) before the
 * app loads, and send the resulting token as a Bearer header.
 *
 * <p>Still works, but identity is no longer Mateu's job: Mateu does not authenticate, it reads the
 * principal your host framework authenticated (Spring Security, Quarkus OIDC, Micronaut Security,
 * MicroProfile JWT, ASP.NET Core, your FastAPI dependency…) or what a {@link
 * io.mateu.uidl.security.PrincipalResolver} bean returns. See the "Security" page of the user
 * manual (/java-user-manual/advanced/security/).
 *
 * @deprecated use your framework's authentication (an OIDC login / resource server for Keycloak)
 *     and, for an identity Mateu cannot see by itself, a {@link
 *     io.mateu.uidl.security.PrincipalResolver} bean instead.
 */
@Deprecated(since = "3.0-alpha.412", forRemoval = true)
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE}) // can use in method only.
public @interface KeycloakSecured {

  String url();

  String realm();

  String clientId();

  String jsUrl() default "";
}
