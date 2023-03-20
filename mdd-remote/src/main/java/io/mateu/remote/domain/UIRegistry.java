package io.mateu.remote.domain;

import java.util.ArrayList;
import java.util.List;

public class UIRegistry {

    private static List<Class> _classes = new ArrayList<>();

    public static void add(Class uiClass) {
        if (!_classes.contains(uiClass)) {
            _classes.add(uiClass);
        }
    }


    public static List<Class> getUiClasses() {
        return _classes;
    }
}
