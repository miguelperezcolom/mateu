package io.mateu.util.notification;

import com.vaadin.ui.Notification;
import com.vaadin.ui.UI;

import java.lang.reflect.InvocationTargetException;

public class Notifier {

    public static void alert(String msg) {
        System.out.println(msg);
        if (UI.getCurrent() != null) Notification.show("Alert",
                msg,
                Notification.Type.ERROR_MESSAGE);
    }



    public static void alert(Throwable throwable) {
        throwable.printStackTrace();

        if (throwable instanceof InvocationTargetException) {
            throwable = throwable.getCause();
        }

        String msg = (throwable.getMessage() != null)?throwable.getMessage():throwable.getClass().getName();

        //StringWriter sw = new StringWriter();
        //throwable.printStackTrace(new PrintWriter(sw));
        if (UI.getCurrent() != null) Notification.show("Error",
                msg,
                //sw.toString(),
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
