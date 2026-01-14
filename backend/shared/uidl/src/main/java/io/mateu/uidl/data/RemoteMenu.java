package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import java.util.Map;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record RemoteMenu(
    String baseUrl,
    String route,
    String consumedRoute,
    String appServerSideType,
    String serverSideType,
    Map<String, Object> params,
    boolean explode,
    String label,
    String path)
    implements Actionable {

  public RemoteMenu(String baseUrl) {
    this(baseUrl, "", "", "", "", Map.of(), false, null, null);
  }

  public RemoteMenu(String baseUrl, boolean explode) {
    this(baseUrl, "", "", "", "", Map.of(), explode, null, null);
  }

  public RemoteMenu(String baseUrl, String route, boolean explode) {
    this(baseUrl, route, "", "", "", Map.of(), explode, null, null);
  }

  public RemoteMenu(String baseUrl, String route) {
    this(baseUrl, route, "", "", "", Map.of(), false, null, null);
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
