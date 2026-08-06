package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a view whose FULL response — structure <em>and</em> data — never varies per request, user
 * or time: a static help page, an "about" screen, a fixed dashboard of constants. It is a promise
 * by the developer, like {@code @Action(idempotent=…)}.
 *
 * <p>The client caches the whole response for such a view (in memory, for the session) and, on a
 * return visit within that session, renders it from the cache and SKIPS the server round-trip
 * entirely — the last step of the client structure cache: phase (a) paints the structure instantly,
 * phase (b) shrinks the revalidation, and this drops it altogether. Session scope keeps it safe
 * without a build hash: a full page reload always reloads, so a new deployment is picked up.
 *
 * <p>Do NOT use it on a view whose content depends on data, the logged-in user, permissions, time,
 * or {@code ${…}} interpolation of live state — the client would keep showing the first rendering
 * for the rest of the session. When in doubt, leave it off: phases (a)+(b) already make a return
 * visit cheap.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface StaticView {}
