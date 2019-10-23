package io.mateu.mdd.core;

import com.vaadin.data.BinderValidationStatus;
import com.vaadin.data.BindingValidationStatus;
import com.vaadin.ui.AbstractComponent;
import com.vaadin.ui.Notification;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ExtraFilters;
import javassist.ClassPool;

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
        getPort().setUserData(userData);
    }
    public static UserData getUserData() {
        return (getPort() != null)?getPort().getUserData():null;
    }

    public static User getCurrentUser() {
        try {
            User[] u = {null};
            Helper.notransact(em -> u[0] = em.find(User.class, (MDD.getPort() != null && MDD.getUserData() != null)?MDD.getUserData().getLogin():"system"));
            return u[0];
        } catch (Throwable e) {
            try {
                User[] u = {null};
                Helper.notransact(em -> u[0] = em.find(User.class, "system"));
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
    public static void openView(MDDOpenListViewAction mddOpenListViewAction, Class listViewClass, boolean modifierPressed) {
        getPort().openView(mddOpenListViewAction, listViewClass, modifierPressed);
    }
    public static void openCRUD(AbstractAction action, Class entityClass, String queryFilters, ExtraFilters extraFilters, boolean modifierPressed) {
        getPort().openCRUD(action, entityClass, queryFilters, extraFilters, modifierPressed);
    }
    public static void openEditor(AbstractAction action, Class viewClass, Object object, boolean modifierPressed) {
        getPort().openEditor(action, viewClass, object, modifierPressed);
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
}
