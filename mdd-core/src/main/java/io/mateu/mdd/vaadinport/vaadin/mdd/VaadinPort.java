package io.mateu.mdd.vaadinport.vaadin.mdd;

import com.vaadin.server.Page;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServletRequest;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.reflection.FieldInterfaced;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.views.EditorViewComponent;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Set;

@Slf4j
public class VaadinPort {

    private boolean mobile;
    private boolean ipad;

    public VaadinPort(VaadinRequest vaadinRequest) {

        mobile = Page.getCurrent().getWebBrowser().isAndroid() || Page.getCurrent().getWebBrowser().isIOS() || Page.getCurrent().getWebBrowser().isWindowsPhone();
        ipad = Page.getCurrent().getWebBrowser().isIPad();

        if (vaadinRequest instanceof VaadinServletRequest) {
            HttpServletRequest httpRequest = ((VaadinServletRequest) vaadinRequest).getHttpServletRequest();
            String userAgent = httpRequest.getHeader("User-Agent").toLowerCase();
            if (userAgent.contains("ipad")) { //... }
                mobile = false;
            }
        }

    }

    public boolean isMobile() {
        return mobile;
    }

    public void alert(String msg) {
        Notification.show("Alert",
                msg,
                Notification.Type.ERROR_MESSAGE);
    }

    public void openCRUD(AbstractAction action) {
        log.debug("open crud");

        MDDUI.get().getNavegador().goTo(action);
    }

    public void openEditor(AbstractAction action, Class viewClass, Object id) {
        log.debug("open editor");

        MDDUI.get().getNavegador().goTo(action, viewClass, id);
    }

    public void openWizard(Class firstPageClass) {
        log.debug("open wizard");

        //todo: ver que hacemos con esto
        MDDUI.get().getNavegador().getViewProvider().openWizardPage(firstPageClass);
    }

    public void updateTitle(String title) {
        MDDUI.get().getAppComponent().updateTitle(title);
    }

    public boolean isViewingOfficeCurrency() {
        return "office".equalsIgnoreCase((String) UI.getCurrent().getSession().getAttribute("_viewcurrency"));
    }

    public boolean isViewingCentralCurrency() {
        return "central".equalsIgnoreCase((String) UI.getCurrent().getSession().getAttribute("_viewcurrency"));
    }

    public boolean isIpad() {
        return ipad;
    }

    public void notifyError(String msg) {
        Notification.show(msg, Notification.Type.TRAY_NOTIFICATION);
    }

    public void notifyInfo(String msg) {
        Notification.show(msg, Notification.Type.TRAY_NOTIFICATION);
    }

    public void notifyError(Throwable throwable) {
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
                Notification.Type.TRAY_NOTIFICATION);

    }

    public void saveOrDiscard(String msg, EditorViewComponent editor, Runnable afterSave) {
        Window w = new Window("Please confirm action");

        VerticalLayout l = new VerticalLayout();

        l.addComponent(new Label(msg));

        Button buttonSaveBefore;
        Button buttonYes;
        Button buttonNo;
        HorizontalLayout hl;
        l.addComponent(hl = new HorizontalLayout(buttonSaveBefore = new Button("Save and proceed", e -> {
            try {
                editor.save(false);
                afterSave.run();
            } catch (Throwable t) {
                MDD.alert(t);
            }
            w.close();
        }), buttonYes = new Button("Exit and discard changes", e -> {
            try {
                afterSave.run();
            } catch (Throwable t) {
                MDD.alert(t);
            }
            w.close();
        })
                //, buttonNo = new Button("Abort and stay here", e -> w.close())
        ));

        hl.setDefaultComponentAlignment(Alignment.MIDDLE_RIGHT);

        buttonSaveBefore.addStyleName(ValoTheme.BUTTON_FRIENDLY);
        //buttonNo.addStyleName(ValoTheme.BUTTON_PRIMARY);
        buttonYes.addStyleName(ValoTheme.BUTTON_DANGER);


        w.setContent(l);

        w.center();
        w.setModal(true);

        UI.getCurrent().addWindow(w);
    }


    public void setCurrentUserLogin(String login) {
        UI.getCurrent().getSession().setAttribute("_login", login);
        getApp().updateSession();
        MDDUI.get().getAppComponent().updateSession();
    }

    public String getCurrentUserLogin() {
        return (String) UI.getCurrent().getSession().getAttribute("_login");
    }

    public void openView(AbstractAction action, Class listViewClass) {
        MDDUI.get().getNavegador().goTo(action, listViewClass);
    }




    public void openPrivateAreaSelector() {
        MDDUI.get().getNavegador().goTo("private");
    }


    public void open(AbstractArea a) {
        MDDUI.get().getNavegador().goTo(a);
    }

    public void open(MenuEntry m) {
        MDDUI.get().getNavegador().goTo(m);
    }

    public void open(AbstractModule m) {
        MDDUI.get().getNavegador().goTo(m);
    }

    public void open(Method m) {
        MDDUI.get().getNavegador().goTo(m);
    }

    public void open(Method m, Set selection) {
        MDDUI.get().getNavegador().goTo(m, selection);
    }

    public void open(Method m, Object result) {
        MDDUI.get().getNavegador().goTo(m, result);
    }

    public void open(FieldInterfaced f) {
        MDDUI.get().getNavegador().goTo(f);
    }

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

    public AbstractApplication getApp() {
        return MDDUI.get().getApp();
    }

    public void setApp(AbstractApplication app) {
        MDDUI.get().setApp(app);
    }

    public void info(String msg) {
        Notifier.info(msg);
    }

    public void push(String msg) {
        log.debug("push(" + msg + ")");
        Notification.show(msg, Notification.Type.HUMANIZED_MESSAGE);
        MDDUI.get().push();
    }

    public void pushDone(String msg) {
        log.debug("pushDone(" + msg + ")");
        Notification.show(msg, Notification.Type.HUMANIZED_MESSAGE);
        MDDUI.get().push();
    }


}
