package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import lombok.Builder;
import lombok.With;

import java.util.Map;

@Builder
@With
public record RemoteMenu(
    String baseUrl,
    String route,
    Map<String, Object> params)
        implements Actionable {

    @Override
    public boolean selected() {
        return false;
    }

    @Override
    public String path() {
        return "";
    }

    @Override
    public String label() {
        return "";
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
