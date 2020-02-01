package io.mateu.mdd.vaadinport.vaadin.components.app;

import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.core.util.Pair;

public interface AppComponent {
    void setArea(AbstractArea a);

    void setCoordinates(Pair<AbstractArea, MenuEntry> coordinates);

    void updateSession();

    void updateTitle(String title);

    void setResettingPassword();

    void setSigningIn();

    void setSearching();

    void unselectAll();

    void setSelectingArea();

    void setSelectingArea(boolean force);
}
