package io.mateu.mdd.core;

import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import javassist.ClassPool;

public class MDD {

    private static ClassPool classPool;


    public static MDDPort getPort() {
        return MDDUI.get().getPort();
    }

    public static AbstractApplication getApp() {
        return MDDUI.get().getApp();
    }




    public static void setUserData(UserData userData) {
        getPort().setUserData(userData);
    }
    public static UserData getUserData() {
        return getPort().getUserData();
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
    public static void openCRUD(AbstractAction action, Class entityClass, String queryFilters, boolean modifierPressed) {
        getPort().openCRUD(action, entityClass, queryFilters, modifierPressed);
    }
    public static void openEditor(AbstractAction action, Class viewClass, Object object, boolean modifierPressed) {
        getPort().openEditor(action, viewClass, object, modifierPressed);
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
}
