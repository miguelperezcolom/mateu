package io.mateu.mdd.vaadinport.vaadin.components.oldviews.backends;

import com.vaadin.data.provider.DataProvider;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Grid;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;

import java.util.List;

public abstract class AbstractListViewBackend {

    public abstract List<Component> getListFilterFields(MDDBinder binder);

    public abstract List<Grid.Column> getColumns();

    public abstract List<Button> getListActions();

    public abstract DataProvider getQueryDataProvider();

}
