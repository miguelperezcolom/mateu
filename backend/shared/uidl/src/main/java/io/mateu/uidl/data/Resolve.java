package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * Where a {@link MicroFrontend} is resolved for its first paint.
 *
 * <ul>
 *   <li>{@link #CLIENT} — the renderer asks the remote for it (the default, and how it always was);
 *   <li>{@link #SERVER} — the host asks the remote while it builds the view and embeds the answer
 *       in its own response; a remote that does not answer in time, fails or is down degrades to
 *       {@link #CLIENT}. The fragment still belongs to the remote: its actions go there.
 * </ul>
 */
@Experimental
public enum Resolve {
  CLIENT,
  SERVER
}
