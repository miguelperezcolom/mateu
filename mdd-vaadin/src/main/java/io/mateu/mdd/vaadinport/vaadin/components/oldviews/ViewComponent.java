package io.mateu.mdd.vaadinport.vaadin.components.oldviews;


import com.vaadin.ui.Component;

public interface ViewComponent extends Component {

    String getViewTitle();

    void addViewListener(ViewListener listener);

}
