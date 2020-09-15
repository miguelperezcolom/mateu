package io.mateu.mdd.core.util;

import com.vaadin.ui.Notification;

import java.lang.reflect.InvocationTargetException;

public class Notifier {

    public static void alert(String msg) {
        Notification.show("Alert",
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
        Notification.show("Error",
                msg,
                //sw.toString(),
                Notification.Type.ERROR_MESSAGE);
    }

    public static void info(String msg) {
        Notification.show(msg, Notification.Type.HUMANIZED_MESSAGE);
    }
}
