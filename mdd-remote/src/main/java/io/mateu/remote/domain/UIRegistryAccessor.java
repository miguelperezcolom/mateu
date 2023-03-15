package io.mateu.remote.domain;

import org.springframework.stereotype.Service;

@Service
public class UIRegistryAccessor {

    private static UIRegistryAccessor _instance;

    private final UIRegistry _registry;

    public UIRegistryAccessor(UIRegistry registry) {
        _registry = registry;
        _instance = this;
    }

    public static UIRegistry get() {
        return _instance._registry;
    }

}
