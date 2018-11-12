package io.mateu.mdd.vaadinport.vaadin.components;

import lombok.Getter;
import lombok.Setter;
import io.mateu.mdd.core.util.Helper;

@Getter@Setter
public class ClassOption {

    private Class _class;
    private String _title;

    public ClassOption(Class _class) {
        this._class = _class;
        this._title = Helper.capitalize(_class.getSimpleName());
    }

    @Override
    public String toString() {
        return _title;
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof ClassOption && _class.equals(((ClassOption) obj)._class));
    }
}
