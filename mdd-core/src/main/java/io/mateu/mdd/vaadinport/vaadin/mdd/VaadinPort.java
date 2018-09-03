package io.mateu.mdd.vaadinport.vaadin.mdd;

import com.vaadin.server.Page;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServletRequest;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.MDDPort;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Set;

public class VaadinPort implements MDDPort {

    private boolean mobile;

    public VaadinPort(VaadinRequest vaadinRequest) {

        mobile = Page.getCurrent().getWebBrowser().isAndroid() || Page.getCurrent().getWebBrowser().isIOS() || Page.getCurrent().getWebBrowser().isWindowsPhone();

        if (vaadinRequest instanceof VaadinServletRequest) {
            HttpServletRequest httpRequest = ((VaadinServletRequest) vaadinRequest).getHttpServletRequest();
            String userAgent = httpRequest.getHeader("User-Agent").toLowerCase();
            if (userAgent.contains("ipad")) { //... }
                mobile = false;
            }
        }

    }


    @Override
    public boolean isMobile() {
        return mobile;
    }

    @Override
    public void alert(String msg) {
        Notification.show("Alert",
                msg,
                Notification.Type.ERROR_MESSAGE);
    }

    @Override
    public void openCRUD(AbstractAction action, Class viewClass, String queryFilters, boolean modifierPressed) {
        System.out.println("open crud");

        MDDUI.get().getNavegador().goTo(action, viewClass);
    }

    @Override
    public void openEditor(AbstractAction action, Class viewClass, Object id, boolean modifierPressed) {
        System.out.println("open editor");

        MDDUI.get().getNavegador().goTo(action, viewClass, id);
    }

    @Override
    public void openWizard(Class firstPageClass) {
        System.out.println("open wizard");

        //todo: ver que hacemos con esto
        MDDUI.get().getNavegador().goTo("error no tiene sentido");
    }

    @Override
    public void updateTitle(String title) {
        MDDUI.get().getAppComponent().updateTitle(title);
    }

    @Override
    public boolean isViewingOfficeCurrency() {
        return "office".equalsIgnoreCase((String) UI.getCurrent().getSession().getAttribute("_viewcurrency"));
    }

    @Override
    public boolean isViewingCentralCurrency() {
        return "central".equalsIgnoreCase((String) UI.getCurrent().getSession().getAttribute("_viewcurrency"));
    }


    @Override
    public void setUserData(UserData userData) {
        UI.getCurrent().getSession().setAttribute("_userdata", userData);
        getApp().updateSession();
        MDDUI.get().getAppComponent().updateSession();
    }

    @Override
    public UserData getUserData() {
        return (UserData) UI.getCurrent().getSession().getAttribute("_userdata");
    }

    @Override
    public void openView(AbstractAction action, Class listViewClass, boolean modifierPressed) {
        MDDUI.get().getNavegador().goTo(action, listViewClass);
    }

    @Override
    public void alert(Throwable throwable) {
        throwable.printStackTrace();

        if (throwable instanceof InvocationTargetException) {
            throwable = throwable.getCause();
        }

        String msg = (throwable.getMessage() != null)?throwable.getMessage():throwable.getClass().getName();

        //StringWriter sw = new StringWriter();
        //throwable.printStackTrace(new PrintWriter(sw));
        Notification.show("Error",
                msg,
                //sw.toString(),
                Notification.Type.ERROR_MESSAGE);
    }



    @Override
    public void openPrivateAreaSelector() {
        MDDUI.get().getNavegador().goTo("private");
    }


    @Override
    public void open(AbstractArea a) {
        MDDUI.get().getNavegador().goTo(a);
    }

    @Override
    public void open(MenuEntry m) {
        MDDUI.get().getNavegador().goTo(m);
    }

    @Override
    public void open(AbstractModule m) {
        MDDUI.get().getNavegador().goTo(m);
    }

    @Override
    public void open(Method m) {
        MDDUI.get().getNavegador().goTo(m);
    }

    @Override
    public void open(Method m, Set selection) {
        MDDUI.get().getNavegador().goTo(m, selection);
    }

    @Override
    public void open(Method m, Object result) {
        MDDUI.get().getNavegador().goTo(m, result);
    }

    @Override
    public void open(FieldInterfaced f) {
        MDDUI.get().getNavegador().goTo(f);
    }

    @Override
    public void confirm(String msg, Runnable onOk) {

        Window w = new Window("Please confirm action");

        VerticalLayout l = new VerticalLayout();

        l.addComponent(new Label(msg));

        Button buttonYes;
        Button buttonNo;
        HorizontalLayout hl;
        l.addComponent(hl = new HorizontalLayout(buttonYes = new Button("Yes, do it", e -> {
            try {
                onOk.run();
            } catch (Throwable t) {
                MDD.alert(t);
            }
            w.close();
        }), buttonNo = new Button("No, thanks", e -> {
            w.close();
        })));

        hl.setDefaultComponentAlignment(Alignment.MIDDLE_RIGHT);

        buttonNo.addStyleName(ValoTheme.BUTTON_FRIENDLY);
        buttonYes.addStyleName(ValoTheme.BUTTON_DANGER);


        w.setContent(l);

        w.center();
        w.setModal(true);

        UI.getCurrent().addWindow(w);

    }

    @Override
    public AbstractApplication getApp() {
        return MDDUI.get().getApp();
    }

    @Override
    public void setApp(AbstractApplication app) {
        MDDUI.get().setApp(app);
    }

    @Override
    public void info(String msg) {
        Notification.show("Alert",
                msg,
                Notification.Type.WARNING_MESSAGE);
    }

    @Override
    public void push(String msg) {
        System.out.println("push(" + msg + ")");
        Notification.show(msg, Notification.Type.TRAY_NOTIFICATION);
        MDDUI.get().push();
    }

    @Override
    public void pushDone(String msg) {
        System.out.println("pushDone(" + msg + ")");
        Notification.show(msg, Notification.Type.HUMANIZED_MESSAGE);
        MDDUI.get().push();
    }


}
