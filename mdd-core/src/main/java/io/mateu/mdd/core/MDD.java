package io.mateu.mdd.core;

import com.vaadin.data.BinderValidationStatus;
import com.vaadin.data.BindingValidationStatus;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.*;
import io.mateu.mdd.vaadinport.vaadin.navigation.ComponentWrapper;
import javassist.ClassPool;

import javax.persistence.Entity;
import javax.persistence.Query;
import java.net.URL;
import java.util.Collection;

public class MDD {

    private static ClassPool classPool;
    private static AbstractApplication app;


    public static MDDPort getPort() {
        return (MDDUI.get() != null)?MDDUI.get().getPort():null;
    }

    public static AbstractApplication getApp() {
        try {
            app = MDDUI.get() != null?MDDUI.get().getApp():MDDUI.createApp();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return app;
    }




    public static void setUserData(UserData userData) {
        System.out.println("setUserData(" + userData + ")");
        getPort().setUserData(userData);
    }
    public static UserData getUserData() {
        return (getPort() != null)?getPort().getUserData():null;
    }

    public static User getCurrentUser() {
        try {
            User[] u = {null};
            Helper.notransact(em -> u[0] = em.find(User.class, (MDD.getPort() != null && MDD.getUserData() != null)?MDD.getUserData().getLogin():"system"), false);
            return u[0];
        } catch (Throwable e) {
            try {
                User[] u = {null};
                Helper.notransact(em -> u[0] = em.find(User.class, "system"), false);
                return u[0];
            } catch (Throwable ee) {
                return null;
            }
        }
    }



    public static void openPrivateAreaSelector() {
        getPort().openPrivateAreaSelector();
    }
    public static void open(AbstractArea a) {
        getPort().open(a);
    }
    public static void open(AbstractModule m) {
        getPort().open(m);
    }
    public static void open(MenuEntry m) {
        getPort().open(m);
    }
    public static void openView(MDDOpenListViewAction mddOpenListViewAction, Class listViewClass) {
        getPort().openView(mddOpenListViewAction, listViewClass);
    }
    public static void openCRUD(AbstractAction action) {
        getPort().openCRUD(action);
    }
    public static void openEditor(AbstractAction action, Class viewClass, Object object) {
        getPort().openEditor(action, viewClass, object);
    }

    public static void edit(Object o) {
        MDDUI.get().getNavegador().edit(o);
    }


    public static void notifyError(String msg) {
        getPort().notifyError(msg);
    }
    public static void notifyInfo(String msg) {
        getPort().notifyInfo(msg);
    }
    public static void notify(Throwable throwable) {
        getPort().notifyError(throwable);
    }


    public static void alert(String msg) {
        getPort().alert(msg);
    }
    public static void alert(Throwable throwable) {
        getPort().alert(throwable);
    }
    public static void confirm(String msg, Runnable onOk) {
        getPort().confirm(msg, onOk);
    }

    public static void saveOrDiscard(String msg, EditorViewComponent editor, Runnable afterSave) {
        getPort().saveOrDiscard(msg, editor, afterSave);
    }

    public static void info(String msg) {
        getPort().info(msg);
    }

    public static boolean isMobile() { return getPort().isMobile(); }

    public static void openWizard(Class firstPageClass) {
        getPort().openWizard(firstPageClass);
    }

    public static void updateTitle(String title) {
        getPort().updateTitle(title);
    }

    public static boolean isViewingOfficeCurrency() {
        return getPort().isViewingOfficeCurrency();
    }

    public static boolean isViewingCentralCurrency() {
        return getPort().isViewingCentralCurrency();
    }


    public static void setClassPool(ClassPool classPool) {
        MDD.classPool = classPool;
    }

    public static ClassPool getClassPool() {
        return classPool;
    }

    public static void refreshUI() {
        MDDUI.get().refreshUI();
    }

    public static boolean isIpad() {
        return getPort().isIpad();
    }

    public static void alert(BinderValidationStatus s) {
        StringBuffer msg = new StringBuffer();
        s.getFieldValidationErrors().forEach(e -> {
            if (!"".equals(msg.toString())) msg.append("\n");
            BindingValidationStatus x = (BindingValidationStatus) e;
            if (x.getField() instanceof AbstractComponent && ((AbstractComponent)x.getField()).getCaption() != null) {
                msg.append("" + ((AbstractComponent)x.getField()).getCaption() + " ");
            }
            x.getMessage().ifPresent(m -> msg.append(m));
        });
        Notification.show(msg.toString(), Notification.Type.TRAY_NOTIFICATION);
    }

    public static void openInWindow(String title, Object o) {
        if (o == null) {
            MDD.alert("Nothing to show");
        } else {
            try {

                AbstractViewComponent v = null;
                Class c = o.getClass();
                if (o instanceof Class && ((Class)o).isAnnotationPresent(Entity.class)) v = new JPAListViewComponent((Class) o);
                else if (o instanceof Component) v = new ComponentWrapper(title, (Component) o);
                else if (int.class.equals(c)
                        || Integer.class.equals(c)
                        || long.class.equals(c)
                        || Long.class.equals(c)
                        || double.class.equals(c)
                        || Double.class.equals(c)
                        || String.class.equals(c)
                        || boolean.class.equals(c)
                        || Boolean.class.equals(c)
                        || float.class.equals(c)
                        || Float.class.equals(c)
                ) v = new ComponentWrapper(title, new Label("" + o, ContentMode.HTML));
                else if (URL.class.equals(c)) {
                    if (o.toString().endsWith("pdf")) {
                        BrowserFrame b = new BrowserFrame("Result", new ExternalResource(o.toString()));
                        b.setSizeFull();
                        v = new ComponentWrapper(title, b);
                    } else {
                        v = new ComponentWrapper(title, new Link("Click me to view the result", new ExternalResource(o.toString())));
                    }
                } else if (o instanceof Collection && ((Collection) o).size() > 0 && ((Collection) o).iterator().next() != null && ((Collection) o).iterator().next().getClass().isAnnotationPresent(Entity.class)) {
                    v = new CollectionListViewComponent((Collection) o, ((Collection) o).iterator().next().getClass());
                } else if (Collection.class.isAssignableFrom(c)) {

                    Collection col = (Collection) o;

                    if (col.size() == 0) {
                        v = new ComponentWrapper(title, new Label("Empty list", ContentMode.HTML));
                    } else {

                        if (MDD.isMobile()) {

                            VerticalLayout vl = new VerticalLayout();
                            boolean primero = true;
                            for (Object i : col) {

                                if (primero) primero = false;
                                else vl.addComponent(new Label("--------------"));

                                if (ReflectionHelper.isBasico(i)) {
                                    vl.addComponent(new Label("" + i));
                                } else {
                                    for (FieldInterfaced f : ReflectionHelper.getAllFields(i.getClass())) {
                                        Label l;
                                        vl.addComponent(l = new Label("" + ReflectionHelper.getCaption(f)));
                                        l.addStyleName(ValoTheme.LABEL_BOLD);
                                        l.addStyleName(CSS.NOPADDING);
                                        vl.addComponent(l = new Label("" + ReflectionHelper.getValue(f, i)));
                                        l.addStyleName(CSS.NOPADDING);
                                    }
                                }

                            }

                            v = new ComponentWrapper(title, vl);

                        } else {

                            Object primerElemento = col.iterator().next();

                            Grid g = new Grid();

                            ListViewComponent.buildColumns(g, ListViewComponent.getColumnFields(primerElemento.getClass()), false, false);

                            //g.setSelectionMode(Grid.SelectionMode.MULTI);

                            // añadimos columna para que no haga feo
                            if (g.getColumns().size() == 1) ((Grid.Column)g.getColumns().get(0)).setExpandRatio(1);
                            else g.addColumn((d) -> null).setWidthUndefined().setCaption("");

                            g.setWidth("100%");
                            g.setHeightByRows(col.size());

                            g.setDataProvider(new ListDataProvider((Collection) o));

                            v = new ComponentWrapper(title, g);
                        }

                    }


                } else if (o instanceof Query) {

                    try {
                        v = new ComponentWrapper(title, new PdfComponent((Query) o));
                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }

                } else if (o instanceof RpcView) {
                    v = new RpcListViewComponent((RpcView) o);
                } else if (o.getClass().isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(o.getClass())) {
                    v = new EditorViewComponent(o) {
                        @Override
                        public void goBack() {
                            // no vuelve atrás
                        }
                    };
                } else if (o instanceof Component) {
                    v = new ComponentWrapper(title, (Component) o);
                } else if (o instanceof AbstractAction) {
                    ((AbstractAction) o).run();
                } else if (o instanceof WizardPage) {
                    v = new WizardComponent((WizardPage) o);
                } else {
                    v = new EditorViewComponent(o) {
                        @Override
                        public void goBack() {
                            // no vuelve atrás
                        }
                    };
                }
                if (v != null) {
                    v.setBackable(false);
                    MDDUI.get().openInWindow(v);
                }
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        }
    }
}
