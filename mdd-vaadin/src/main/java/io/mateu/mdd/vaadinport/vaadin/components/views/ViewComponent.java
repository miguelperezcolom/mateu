package io.mateu.mdd.vaadinport.vaadin.components.views;


import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractAction;

public interface ViewComponent extends Component {
    void setOriginatingAction(AbstractAction menu);

    String getViewTitle();

}
