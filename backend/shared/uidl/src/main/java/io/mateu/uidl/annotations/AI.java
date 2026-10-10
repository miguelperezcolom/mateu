package io.mateu.uidl.annotations;

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
public @interface AI {

  String sse();

  /**
   * Path (or absolute url) of the app's MCP endpoint. The chat forwards it with every message so
   * the agent — in-process or the user's local companion — can operate THIS app through its tools.
   */
  String mcp() default "";

  /**
   * Path (or absolute url) where the chat POSTs attached files (multipart). When set, the chat
   * panel shows an attach button; each upload is saved server-side and the assistant reads it (e.g.
   * the agent-cli module saves it to a local directory and exposes it through a filesystem MCP
   * server). Empty = no file attachments.
   */
  String upload() default "";
}
