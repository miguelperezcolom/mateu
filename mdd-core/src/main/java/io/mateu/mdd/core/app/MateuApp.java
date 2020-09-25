package io.mateu.mdd.core.app;

import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.Private;
import io.mateu.mdd.util.Helper;

import java.util.List;

public class MateuApp extends BaseMDDApp {

    private List<AbstractArea> _areas;
    private boolean _authenticationNeeded;

    public MateuApp() {
    }

    @Override
    public String getName() {
        if (getClass().isAnnotationPresent(Caption.class)) return getClass().getAnnotation(Caption.class).value();
        return Helper.capitalize(getClass().getSimpleName());
    }

    @Override
    public List<AbstractArea> buildAreas() {
        if (_areas == null) init();
        return _areas;
    }

    private void init() {
        Class uiclass = this.getClass();

        _areas = new AreaBuilder(this).buildAreas(uiclass);

        _authenticationNeeded = uiclass.isAnnotationPresent(Private.class);
        if (!_authenticationNeeded) {
            _areas.forEach(a -> _authenticationNeeded |= !a.isPublicAccess());
        }
    }

    @Override
    public boolean isAuthenticationNeeded() {
        if (_areas == null) init();
        return _authenticationNeeded;
    }
}
