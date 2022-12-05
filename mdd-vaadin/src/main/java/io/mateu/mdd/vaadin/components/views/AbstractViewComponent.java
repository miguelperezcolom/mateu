package io.mateu.mdd.vaadin.components.views;

import com.google.common.base.Strings;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.util.VaadinHelper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.Method;
import java.util.*;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout {

    private final String uuid = UUID.randomUUID().toString();
    private VaadinIcons icon;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        AbstractViewComponent<?> that = (AbstractViewComponent<?>) o;
        return uuid.equals(that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), uuid);
    }

    private Component header;
    private Label titleLabel;
    private Label subtitleLabel;
    private CssLayout kpisContainer;
    private View view;
    protected CssLayout bar;
    protected CssLayout subheader;
    protected Map<Method, AbstractAction> actionsByMethod = new HashMap<>();
    protected Map<String, Component> menuItemsById = new HashMap<>();
    protected Map<String, List<Component>> menuItemsByGroup = new HashMap<>();
    protected List<String> menuItemIdsUnseen = new ArrayList<>();
    private String title;
    private String subtitle;
    private HorizontalLayout hiddens;
    private boolean backable;
    private boolean built;
    private AbstractViewComponent parentView;
    private Label iconLabel;
    private Component backButton;

    public AbstractViewComponent getParentView() {
        return parentView;
    }

    public VaadinIcons getIcon() {
        return icon;
    }

    public void setIcon(VaadinIcons icon) {
        this.icon = icon;
    }

    public void setParentView(AbstractViewComponent parentView) {
        this.parentView = parentView;
    }

    public CssLayout getKpisContainer() {
        return kpisContainer;
    }

    public AbstractViewComponent() {
    }

    public boolean esForm() {
        return false;
    }

    public void addActionsBar(boolean top) {
        if (!isBarHidden()) {
            bar = new CssLayout();
            if (top) bar.addStyleName("actionsbar");
            else bar.addStyleName("formactionsbar");
            bar.addStyleName(CSS.NOPADDING);
            menuItemsById = new HashMap<>();
            addBack(bar);
            getActionsContainer().addComponent(bar);
        }
    }

    public void hideHeader() {
        header.setVisible(false);
    }

    public boolean expandOnOpen() {
        return false;
    }

    public boolean mustCreateHeader() {
        return true;
    }

    private Component createHeader() {
        HorizontalLayout l = new HorizontalLayout();

        l.addStyleName("viewHeader");

        l.addComponent(createTitleLabel());

        hiddens = new HorizontalLayout();
        hiddens.addStyleName("hidden");

        l.addComponent(hiddens);


        return l;
    }

    public void setStack(ViewStack stack) {
        boolean add = false; //MDDUIAccessor.isMobile();
        int pos = 0;
        if (!add && stack.size() > 0) {
            while (!add && pos < stack.size()) {
                View v = stack.get(pos);
                Component c = v.getComponent();
                if (!(c instanceof FakeComponent || c instanceof AreaComponent || c instanceof SearchInMenuComponent || c instanceof MenuComponent || c instanceof HomeComponent)) add = true;
                if (!add) {
                    if (c instanceof ComponentWrapper && ((ComponentWrapper) c).getComponentCount() > 0) {
                        c = ((ComponentWrapper) c).getComponent(0);
                        if (!(c instanceof FakeComponent || c instanceof AreaComponent || c instanceof SearchInMenuComponent || c instanceof MenuComponent || c instanceof HomeComponent)) add = true;
                    }
                }
                if (!add) pos++;
            }
        }
        if (add && this instanceof AbstractViewComponent) {
            ((AbstractViewComponent) this).setBackable(true);
            if (this instanceof EditorViewComponent) {
                ((EditorViewComponent) this).setKpisContainer(kpisContainer);
                ((EditorViewComponent) this).buildIfNeeded();
                ((EditorViewComponent) this).rebuildActions();
            }
        }
    }

    private Component createTitleLabel() {

        kpisContainer = new CssLayout();
        kpisContainer.addStyleName(CSS.NOPADDING);
        kpisContainer.addStyleName("kpisContainer");
        kpisContainer.setSizeUndefined();

        HorizontalLayout hl = new HorizontalLayout();
        hl.addStyleName(CSS.NOPADDING);

        if (mustCreateHeader()) {
            iconLabel = new Label("", ContentMode.HTML);
            iconLabel.addStyleName("viewIcon");

            titleLabel = new Label("", ContentMode.HTML);
            titleLabel.addStyleName("viewTitle");

            subtitleLabel = new Label("", ContentMode.HTML);
            subtitleLabel.addStyleName("viewSubtitle");

            VerticalLayout titles = new VerticalLayout(titleLabel, subtitleLabel);
            titles.addStyleName(CSS.NOPADDING);


            if (false && getIcon() != null) iconLabel.setValue(getIcon().getHtml());
            else iconLabel.setVisible(false);

            hl.addComponents(iconLabel, titles);
        }

        hl.addComponent(kpisContainer);


        return hl;
    }


    public void updateViewTitle(String newTitle, String newSubtitle) {
        title = newTitle;
        subtitle = newSubtitle;
        updatePageTitle();
    }

    public void updatePageTitle() {
        if (titleLabel != null) {
            titleLabel.setValue(getTitle());
        }
        if (subtitleLabel != null) {
            subtitleLabel.setValue(getSubtitle());
        }
        if (iconLabel != null) {
            if (false && getIcon() != null) {
                iconLabel.setValue(getIcon().getHtml());
                iconLabel.setVisible(true);
            } else iconLabel.setVisible(false);
        }
    }

    public HorizontalLayout getHiddens() {
        return hiddens;
    }

    public String getTitle() {
        return title != null?title:toString();
    }

    public String getSubtitle() {
        return subtitle != null?subtitle:"";
    }

    public String getPageTitle() {
        return getTitle();
    }

    public A setTitle(String title) {
        this.title = title;
        return (A) this;
    }

    public View getView() {
        return view;
    }

    public void setView(View view) {
        this.view = view;
    }

    public Layout getActionsContainer() {
        return this;
    }

    public A buildIfNeeded() {
        if (!built) {
            try {
                build();
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
        return (A) this;
    }

    public A build() throws Exception {
        addStyleName("viewcomponent");

        addComponent(header = createHeader());

        if (!esForm()) addActionsBar(true);

        addComponent(subheader = new CssLayout());
        subheader.addStyleName(CSS.NOPADDING);
        subheader.setWidth("100%");
        subheader.setVisible(false);

        if (!esForm()) addViewActionsMenuItems(bar);

        built = true;
        return (A) this;
    }

    private void addBack(CssLayout bar) {
            if (!isActionPresent("back")) {
                Button b;
                bar.addComponent(backButton = b = new Button("", VaadinIcons.ARROW_LEFT));
                //bar.addComponent(i = b = new Button("Back", VaadinIcons.ARROW_LEFT));
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addClickListener(e -> {
                    try {

                        if (AbstractViewComponent.this.beforeBack()) MDDUIAccessor.goBack();

                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                });

                addMenuItem("back", backButton);

            } else {
                backButton = getMenuItemById("back");
            }
            if (isBackable()) backButton.setVisible(true);
    }

    public void addViewActionsMenuItems(CssLayout bar) {

        if (isActionPresent("back")) {
            getMenuItemById("back").setVisible(isBackable());
        }

        boolean firstButton = true;

        for (AbstractAction a : getActions()) {
                Component i = null;
                if (!isActionPresent(a.getId())) {
                    Button b;
                    i = b = new Button(a.getCaption(), a.getIcon());
                    b.addStyleName(ValoTheme.BUTTON_QUIET);
                    b.addClickListener(e -> {
                        try {

                            //añade validación, confirmación y updatea después de ejecutar
                            Runnable r = new Runnable() {
                                @Override
                                public void run() {

                                    try {
                                        new AcctionRunner().run(a);
                                    } catch (Throwable ex) {
                                        Notifier.alert(ex);
                                        removeStyleName("refreshonback");
                                    }

                                }
                            };

                            boolean doIt = true;
                            if (AbstractViewComponent.this instanceof EditorViewComponent && a.isValidationNeeded()) {
                                doIt = ((EditorViewComponent)AbstractViewComponent.this).validate();
                            }

                            if (doIt) {
                                if (!Strings.isNullOrEmpty(a.getConfirmationMessage())) {
                                    VaadinHelper.confirm(a.getConfirmationMessage(), () -> {

                                        r.run();

                                        //todo: actualizar vista con los cambios en el modelo

                                    });
                                } else r.run();
                            }

                        } catch (Throwable throwable) {
                            Notifier.alert(throwable);
                        }
                    });

                    if (!Strings.isNullOrEmpty(a.getGroup())) menuItemsByGroup.computeIfAbsent(a.getGroup(), k -> new ArrayList<>()).add(i);
                    addMenuItem(a.getId(), i);

                    if (!Strings.isNullOrEmpty(a.getStyle())) i.addStyleName(a.getStyle());

                    if (Strings.isNullOrEmpty(a.getGroup())) {
                        bar.addComponent(i);
                        if (esForm() && firstButton) {
                            b.setClickShortcut(ShortcutAction.KeyCode.ENTER);
                            b.addStyleName(ValoTheme.BUTTON_PRIMARY);
                            firstButton = false;
                        }
                    }

                    a.addShortCut(b);

                } else {
                    i = getMenuItemById(a.getId());
                }
                if (i != null && !Strings.isNullOrEmpty(a.getStyle())) i.addStyleName(a.getStyle());
                i.setVisible(a.isVisible());
            }

        if (bar != null) if  (bar.getComponentCount() == 0 || (bar.getComponentCount() == 1 && !bar.getComponent(0).isVisible())) bar.setVisible(false);
    }

    public boolean beforeBack() {
        return true;
    }

    public void markAllAsUnseen() {
        menuItemIdsUnseen = new ArrayList<>(menuItemsById.keySet());
    }

    public List<String> getUnseenActions() {
        return menuItemIdsUnseen;
    }

    public void removeUnseen() {
        for (String id : menuItemIdsUnseen) menuItemsById.get(id).setVisible(false);
    }

    public boolean isActionPresent(String id) {
        boolean found = menuItemsById.containsKey(id);
        if (found) menuItemIdsUnseen.remove(id);
        return found;
    }

    public Component getMenuItemById(String id) {
        return menuItemsById.get(id);
    }

    public void addMenuItem(String id, Component i) {
        menuItemsById.put(id, i);
    }


    public List<AbstractAction> getActions() {
        return new ArrayList<>();
    }


    public AbstractAction getActionByMethod(Method m) {
        return actionsByMethod.get(m);
    }

    public void setAction(Method m, AbstractAction action) {
        actionsByMethod.put(m, action);
    }


    public boolean isBackable() {
        return backable;
    }

    public void setBackable(boolean backable) {
        this.backable = backable;
        if (backButton != null) backButton.setVisible(backable);
    }

    public boolean isBarHidden() {
        return false;
    }
}
