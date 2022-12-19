package io.mateu.mdd.core.app;

import com.vaadin.contextmenu.ContextMenu;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.renderers.ClickableRenderer;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.util.notification.Notifier;

public class ColumnActionGroup extends ColumnAction {

    private final ColumnAction[] actions;

    public ColumnActionGroup(ColumnAction[] actions) {
        super(null, null, () -> VaadinIcons.ELLIPSIS_DOTS_V);
        this.actions = actions;
    }

    @Override
    public String toString() {
        return VaadinIcons.ELLIPSIS_DOTS_V.getHtml();
    }

    public void run(ClickableRenderer.RendererClickEvent event, Refreshable resultsComponent) {

        ContextMenu contextMenu = new ContextMenu((AbstractComponent) event.getComponent(), true);
        contextMenu.open(event.getClientX(), event.getClientY());

        for (ColumnAction action: actions) {
            try {

                contextMenu.addItem(action.valueProvider != null ? action.valueProvider.call() : null
                        , action.iconProvider != null ? action.iconProvider.call() : null, new MenuBar.Command() {
                            @Override
                            public void menuSelected(MenuBar.MenuItem menuItem) {

                                try {
                                    action.run();
                                } catch (Exception ex) {
                                    Notifier.alert(ex);
                                }
                                try {
                                    resultsComponent.refresh();
                                } catch (Throwable ex) {
                                    ex.printStackTrace();
                                }

                            }
                        });

            } catch (Exception e) {
                e.printStackTrace();
            }
        }


    }
}
