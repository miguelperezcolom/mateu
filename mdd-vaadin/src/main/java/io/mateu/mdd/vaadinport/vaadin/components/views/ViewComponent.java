package io.mateu.mdd.vaadinport.vaadin.components.views;


import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MenuEntry;

public interface ViewComponent extends Component {
    void setOriginatingAction(MenuEntry menu);

    String getViewTitle();

}
