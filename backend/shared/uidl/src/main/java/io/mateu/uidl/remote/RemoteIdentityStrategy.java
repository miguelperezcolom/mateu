package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/**
 * How the host calls a remote on the user's behalf: the headers that carry the caller's identity (a
 * token exchanged for one whose audience is the remote, preferably; the user's own token at least).
 * A remote names its strategy in {@link RemoteDescriptor#identity()}.
 *
 * <p>Mateu ships {@value #NONE} (anonymous) and {@value #FORWARD_AUTHORIZATION} (the request's own
 * {@code Authorization} header, sent only to registered remotes). Token exchange is the
 * application's: declare a bean of this type with your own {@link #name()} — Mateu ships UI only,
 * never an OAuth client.
 *
 * <p>Called off the request thread, inside the fragment's time budget, so a strategy may block (an
 * exchange round trip).
 */
@Experimental
public interface RemoteIdentityStrategy {

  /** No identity: the remote is called anonymously. */
  String NONE = "none";

  /** The incoming request's {@code Authorization} header, forwarded as is. */
  String FORWARD_AUTHORIZATION = "forward-authorization";

  /** The name a {@link RemoteDescriptor} refers to this strategy by. */
  String name();

  /** The headers to add to the call to {@code remote} made for {@code request}'s caller. */
  Map<String, String> headers(RemoteDescriptor remote, HttpRequest request);
}
