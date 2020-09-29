package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.security.Private;
import io.mateu.util.Helper;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MateuApp extends BaseMDDApp {

    private final Object ui;
    private List<AbstractArea> _areas;
    private boolean _authenticationNeeded;
    private Class uiclass;

    public MateuApp() throws Exception {
        this(null);
    }

    public MateuApp(Class uiclass) throws Exception {
        this.uiclass = uiclass != null?uiclass:getClass();
        ui = uiclass != null?ReflectionHelper.newInstance(uiclass):this;
        init();
    }

    @Override
    public String getName() {
        if (_areas == null) init();
        if (uiclass.isAnnotationPresent(Caption.class)) return ((Caption)uiclass.getAnnotation(Caption.class)).value();
        return Helper.capitalize(uiclass.getSimpleName());
    }

    @Override
    public List<AbstractArea> buildAreas() {
        if (_areas == null) init();
        return _areas;
    }

    private void init() {
        _areas = new AreaBuilder(ui).buildAreas(uiclass);

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

    @Override
    public AbstractArea getDefaultPublicArea() {
        if (_areas == null) init();
        return _areas.stream().filter(a -> a.isPublicAccess()).findFirst().orElse(null);
    }
}
