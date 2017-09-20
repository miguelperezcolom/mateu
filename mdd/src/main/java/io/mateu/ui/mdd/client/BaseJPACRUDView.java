package io.mateu.ui.mdd.client;

import io.mateu.ui.core.client.components.fields.TextField;
import io.mateu.ui.core.client.components.fields.grids.columns.AbstractColumn;
import io.mateu.ui.core.client.components.fields.grids.columns.TextColumn;
import io.mateu.ui.core.client.views.AbstractEditorView;
import io.mateu.ui.core.client.views.AbstractForm;
import io.mateu.ui.core.client.views.ViewForm;

import java.util.Arrays;
import java.util.List;

/**
 * Created by miguel on 11/1/17.
 */
public abstract class BaseJPACRUDView extends JPACRUDView {

    @Override
    public AbstractEditorView getNewEditorView() {
        return new JPAEditorView(this) {
            @Override
            public String getTitle() {
                return getEntityClassName().substring(getEntityClassName().lastIndexOf(".") + 1);
            }

            @Override
            public void build() {
                add(new TextField("name", "Name"));
            }
        };
    }

    @Override
    public List<AbstractColumn> createExtraColumns() {
        return Arrays.asList(new TextColumn("col1", "Name", 200, false));
    }

    @Override
    public String getSql() {
        return "select x.id, x.name from " + getEntityClassName() + " x order by x.name";
    }

    @Override
    public String getTitle() {
        return getEntityClassName().substring(getEntityClassName().lastIndexOf(".") + 1) + "s";
    }

    @Override
    public AbstractForm createForm() {
        return new ViewForm(this).add(new TextField("name", "Name"));
    }
}
