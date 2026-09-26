package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import java.util.Map;
import lombok.Builder;
import lombok.With;

/**
 * A section of a federated shell served by another app: the shell asks {@code baseUrl} for its menu
 * and puts it where this entry is, and a deep link under one of that app's routes is mounted from
 * it.
 *
 * <p>{@code hidden} keeps the second half without the first: the remote still resolves deep links
 * and reloads under its routes, but nothing of it appears in the menu. For a section reached some
 * other way — a header widget, a link in a notification — where a menu entry would only repeat it.
 * Declared with {@code @Hidden} on the {@code @Menu} field, or {@code withHidden(true)}.
 */
@Builder
@With
public record RemoteMenu(
    String baseUrl,
    String route,
    String consumedRoute,
    String serverSideType,
    Map<String, Object> params,
    boolean explode,
    String label,
    String path,
    boolean hidden)
    implements Actionable {

  public RemoteMenu(
      String baseUrl,
      String route,
      String consumedRoute,
      String serverSideType,
      Map<String, Object> params,
      boolean explode,
      String label,
      String path) {
    this(baseUrl, route, consumedRoute, serverSideType, params, explode, label, path, false);
  }

  public RemoteMenu(String baseUrl) {
    this(baseUrl, "", "_empty", "", Map.of(), false, null, null);
  }

  public RemoteMenu(String baseUrl, boolean explode) {
    this(baseUrl, "", "_empty", "", Map.of(), explode, null, null);
  }

  public RemoteMenu(String baseUrl, String route, boolean explode) {
    this(baseUrl, route, "_empty", "", Map.of(), explode, null, null);
  }

  public RemoteMenu(String baseUrl, String route) {
    this(baseUrl, route, "_empty", "", Map.of(), false, null, null);
  }

  @Override
  public boolean selected() {
    return false;
  }

  @Override
  public Component component() {
    return null;
  }

  @Override
  public String className() {
    return "";
  }

  @Override
  public boolean disabled() {
    return false;
  }

  @Override
  public boolean disabledOnClick() {
    return false;
  }

  @Override
  public Object itemData() {
    return null;
  }
}
