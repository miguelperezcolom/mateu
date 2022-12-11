package io.mateu.mdd.core.app;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.*;
import com.vaadin.ui.renderers.ClickableRenderer;
import com.vaadin.ui.themes.ValoTheme;

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
        Window w = new Window();
        VerticalLayout vl = new VerticalLayout();
        for (ColumnAction action: actions) {
            try {
                Button b;
                vl.addComponent(b = new Button(action.valueProvider != null?action.valueProvider.call():null
                        , action.iconProvider != null?action.iconProvider.call():null));
                b.addClickListener(e -> {
                    action.run();
                    try {
                        resultsComponent.refresh();
                    } catch (Throwable ex) {
                        ex.printStackTrace();
                    }
                });
                b.addStyleName(ValoTheme.BUTTON_QUIET);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        w.setContent(vl);
        w.setVisible(true);
        w.setClosable(false);
        w.setModal(false);
        w.setResizable(false);
        UI.getCurrent().addWindow(w);
        w.setPosition(event.getClientX() + 10, event.getClientY() + 10);
        new Thread(() -> {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            w.close();
        }).start();
    }
}
