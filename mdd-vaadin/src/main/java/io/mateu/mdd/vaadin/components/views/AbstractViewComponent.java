package io.mateu.mdd.vaadin.components.views;

import com.google.common.base.Strings;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Layout;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.layout.MiFormLayout;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.MenuComponent;
import io.mateu.mdd.vaadin.navigation.MateuViewProvider;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.util.VaadinHelper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public abstract class AbstractViewComponent<A extends AbstractViewComponent<A>> extends VerticalLayout {

    private final String uuid = UUID.randomUUID().toString();
    private VaadinIcons icon;
    protected Layout actionsSection;

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
    private NavBarComponent navBar;
    private Label titleLabel;
    private Label subtitleLabel;
    private CssLayout actionsContainer;
    private CssLayout kpisContainer;
    private View view;
    protected CssLayout bar;
    protected CssLayout actions;
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

            if (top) {
                bar = new CssLayout();
                bar.addStyleName("actionsbar");
                bar.addStyleName(CSS.NOPADDING);
                menuItemsById = new HashMap<>();
                if (getActionsBarContainer() != null) getActionsBarContainer().addComponent(bar);
            } else {
                actionsSection = (MDDUIAccessor.isMobile())?new VerticalLayout():new MiFormLayout();
                actionsSection.addStyleName("section");
                if (false) {
                    actionsSection.setSizeUndefined();
                    actionsSection.addStyleName("section");
                }
                actionsSection.addStyleName("sectioncard");

                VerticalLayout fieldGroup;
                actionsSection.addComponent(fieldGroup = new VerticalLayout());
                fieldGroup.setWidthFull();
                fieldGroup.addStyleName(CSS.NOPADDING);

                HorizontalLayout fieldGroupHeader = null;
                fieldGroup.addStyleName("fieldgroup");
                fieldGroup.addComponent(fieldGroupHeader = new HorizontalLayout());
                fieldGroup.setWidthFull();
                fieldGroupHeader.setWidthFull();
                fieldGroupHeader.addStyleName("fieldgroupheader");

                String actionsTitle = getMainActionsTitle();
                String actionsText = getMainActionsText();

                Label c;
                fieldGroupHeader.addComponent(c = new Label(actionsTitle));
                c.addStyleName(ValoTheme.LABEL_H4);

                if (!"".equals(actionsText)) {
                    Label l;
                    fieldGroup.addComponent(l = new Label(actionsText, ContentMode.HTML));
                    l.setWidthFull();
                }

                getActionsContainer().addComponent(actionsSection);

                actions = new CssLayout();
                actions.addStyleName("formactionsbar");
                actions.addStyleName(CSS.NOPADDING);
                fieldGroup.addComponent(actions);
                fieldGroup.setComponentAlignment(actions, Alignment.BOTTOM_RIGHT);
            }

        }
    }

    public String getMainActionsText() {
        return "";
    }

    public String getMainActionsTitle() {
        return "Actions";
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

    protected Component createHeader() {
        HorizontalLayout l = new HorizontalLayout();
        l.setSpacing(false);

        l.addStyleName("viewHeader");
        l.setWidthFull();

        Component left;
        l.addComponent(left = createTitleLabel());

        hiddens = new HorizontalLayout();
        hiddens.addStyleName("hidden");
        hiddens.setWidth("0px");

        l.addComponent(hiddens);
        l.setExpandRatio(left, 1.0f);

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

    private void addBreadCrumb() {
        ViewStack stack = MateuUI.get().getStack();
        int breadCrumbsNumber = 0;
        for (int i = 0; i < stack.size(); i++) {
            View v = stack.get(i);
            if (v.getViewComponent() != null && v.getViewComponent() != this && (v.getViewComponent() instanceof ListViewComponent || v.getViewComponent() instanceof EditorViewComponent)) {
                if (breadCrumbsNumber > 0) navBar.addComponent(new Label("/"));
                navBar.addComponent(new Label(v.getViewComponent().getTitle()));
                breadCrumbsNumber++;
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
        hl.setWidthFull();

        actionsContainer = new CssLayout();
        actionsContainer.addStyleName(CSS.NOPADDING);

        if (mustCreateHeader()) {
            iconLabel = new Label("", ContentMode.HTML);
            iconLabel.addStyleName("viewIcon");

            titleLabel = new Label("", ContentMode.HTML);
            titleLabel.addStyleName("viewTitle");

            subtitleLabel = new Label("", ContentMode.HTML);
            subtitleLabel.addStyleName("viewSubtitle");

            VerticalLayout titles = new VerticalLayout(titleLabel, subtitleLabel);
            titles.addStyleName(CSS.NOPADDING);
            titles.setWidthUndefined();


            if (false && getIcon() != null) iconLabel.setValue(getIcon().getHtml());
            else iconLabel.setVisible(false);


            hl.addComponents(iconLabel, titles, kpisContainer, actionsContainer);
            hl.setExpandRatio(actionsContainer, 1);
        } else {
            hl.addComponents(actionsContainer, kpisContainer);
            hl.setExpandRatio(actionsContainer, 1);
        }
        hl.setComponentAlignment(actionsContainer, Alignment.TOP_RIGHT);
        hl.setComponentAlignment(kpisContainer, Alignment.TOP_RIGHT);


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

    public Layout getActionsBarContainer() {
        return actionsContainer;
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
        setWidthFull();

        addComponent(navBar = createNavBar());
        addBack(navBar);
        if (mustAddBreadcrumb()) addBreadCrumb();

        if (mustAddHeader()) addComponent(header = createHeader());

        addStatusBar();

        addActionsBar(true);
        addViewActionsMenuItems(getActionsContainer(), getActions());

        addComponent(subheader = new CssLayout());
        subheader.addStyleName(CSS.NOPADDING);
        subheader.setWidth("100%");
        subheader.setVisible(false);

        built = true;
        return (A) this;
    }

    public void addStatusBar() {
    }

    public boolean mustAddHeader() {
        return true;
    }

    public boolean mustAddBreadcrumb() {
        return true;
    }

    public NavBarComponent createNavBar() {
        return new NavBarComponent();
    }

    private void addBack(HorizontalLayout bar) {
            if (!isActionPresent("back")) {
                Button b;
                bar.addComponent(backButton = b = new Button("", VaadinIcons.ARROW_LEFT), 0);
                //bar.addComponent(i = b = new Button("Back", VaadinIcons.ARROW_LEFT));
                b.addStyleName(ValoTheme.BUTTON_QUIET);
                b.addClickListener(e -> {
                    try {

                        if (AbstractViewComponent.this.beforeBack()) MDDUIAccessor.goBack();

                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                });
                b.setVisible(false);

                addMenuItem("back", backButton);

            } else {
                backButton = getMenuItemById("back");
            }
            if (isBackable()) backButton.setVisible(true);
    }

    public void addViewActionsMenuItems(Layout bar, List<AbstractAction> actions) {

        if (isActionPresent("back")) {
            getMenuItemById("back").setVisible(isBackable());
        }

        boolean firstButton = true;

        for (AbstractAction a : actions) {
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

        if (bar != null) if  (bar.getComponentCount() == 0) bar.setVisible(false);
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

    public List<AbstractAction> getActions(String key) {
        return new ArrayList<>();
    }

    public List<AbstractAction> getActions() {
        return new ArrayList<>();
    }

    public List<AbstractAction> getMainActions() {
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
