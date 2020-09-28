package io.mateu.mdd.vaadin.components.app;

import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.util.common.Pair;

public interface AppComponent {
    void setArea(AbstractArea a);

    void setCoordinates(Pair<AbstractArea, MenuEntry> coordinates);

    void updateSession();

    void updateTitle(String title);

    void setResettingPassword();

    void setSigningIn();

    boolean isSigningIn();

    void setSignedIn();

    void setSignedOut();

    void setSearching();

    void unselectAll();

    void setSelectingArea();

    void setSelectingArea(boolean force);
}
