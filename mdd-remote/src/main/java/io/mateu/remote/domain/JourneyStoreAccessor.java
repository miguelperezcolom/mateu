package io.mateu.remote.domain;

import org.springframework.stereotype.Service;

@Service
public class JourneyStoreAccessor {

    private static JourneyStoreAccessor _instance;

    private final JourneyStore _store;

    public JourneyStoreAccessor(JourneyStore store) {
        _store = store;
        _instance = this;
    }

    public static JourneyStore get() {
        return _instance._store;
    }

}
