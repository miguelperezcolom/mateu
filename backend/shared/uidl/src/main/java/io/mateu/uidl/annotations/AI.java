package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Wires the AI assistant chat panel (and the MCP endpoint it drives) into the app shell.
 *
 * <p>Experimental: the AI chat / MCP integration may change in a minor release.
 */
@Experimental("AI chat panel and MCP wiring")
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE}) // can use in method only.
@Documented
public @interface AI {

  String sse();

  /**
   * Path (or absolute url) of the app's MCP endpoint. The chat forwards it with every message so
   * the agent can operate THIS app through its tools.
   */
  String mcp() default "";

  /**
   * Path (or absolute url) where the chat POSTs attached files (multipart). When set, the chat
   * panel shows an attach button; the application's endpoint stores each upload where its agent can
   * read it. Empty = no file attachments.
   */
  String upload() default "";

  /**
   * The text of the chat panel's Follow mode button while it is OFF — the toggle that decides
   * whether the view follows the assistant (its navigations and generated screens open as they
   * arrive) or stays where the user is (they wait in the conversation as buttons). Empty = the
   * renderer's own, in the user's language ("Follow", "Seguir").
   */
  @Experimental("AI chat follow mode (3.0 beta)")
  String followLabel() default "";

  /**
   * The text of the Follow mode button while it is ON (the default state), e.g. {@code
   * followingLabel = "Following the copilot"}. Empty = the renderer's own, in the user's language
   * ("Following", "Siguiendo").
   */
  @Experimental("AI chat follow mode (3.0 beta)")
  String followingLabel() default "";
}
