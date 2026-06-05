package io.mateu.uidl.interfaces;

public interface Selector<IdType> {

    SelectedItem<IdType> selected(HttpRequest httpRequest);

    String fieldId();

    Selector withFieldId(String name);
}
