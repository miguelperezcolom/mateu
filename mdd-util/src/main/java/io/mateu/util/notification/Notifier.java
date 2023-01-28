package io.mateu.util.notification;

import com.vaadin.ui.Notification;
import com.vaadin.ui.UI;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.InvocationTargetException;

@Slf4j
public class Notifier {

    public static void alert(String msg) {
        log.info(msg);
        if (UI.getCurrent() != null) Notification.show("Alert",
                msg,
                Notification.Type.ERROR_MESSAGE);
    }

    public static void alert(Throwable throwable) {
        log.error("Exception raised", throwable);

        if (throwable instanceof InvocationTargetException) {
            throwable = throwable.getCause();
        }

        String msg = (throwable.getMessage() != null)?throwable.getMessage():throwable.getClass().getName();

        if (UI.getCurrent() != null) Notification.show("Error",
                msg,
                Notification.Type.ERROR_MESSAGE);
    }

    public static void info(String msg) {
        Notification.show(msg, Notification.Type.HUMANIZED_MESSAGE);
    }

    public static void push(String msg) {
        Notification.show(msg, Notification.Type.HUMANIZED_MESSAGE);
    }

    public static void pushDone(String msg) {
        Notification.show(msg, Notification.Type.HUMANIZED_MESSAGE);
    }

}
