package io.mateu.mdd.core;

import com.vaadin.data.BinderValidationStatus;
import com.vaadin.data.BindingValidationStatus;
import com.vaadin.server.VaadinSession;
import com.vaadin.server.WrappedHttpSession;
import com.vaadin.ui.AbstractComponent;
import com.vaadin.ui.Notification;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.shared.annotations.Forbidden;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.ReadWrite;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.security.MateuSecurityManager;
import io.mateu.security.Private;
import io.mateu.util.Helper;
import javassist.ClassPool;

import javax.servlet.http.HttpSession;

public class MDD {

    private static ClassPool classPool;
    private static AbstractApplication app;

    public static void setClassPool(ClassPool classPool) {
        MDD.classPool = classPool;
    }

    public static ClassPool getClassPool() {
        return classPool;
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


    public static boolean check(Private pa) {
        return check(pa.roles(), pa.users());
    }

    private static boolean check(String[] permissions, String[] users) {
        boolean add = false;
        UserPrincipal u = MDD.getCurrentUser();
        if (u == null) return false;

        boolean usuarioOk = false;
        if (u != null && users != null && users.length > 0) {
            for (int i = 0; i < users.length; i++) {
                if (u.getLogin().equalsIgnoreCase(users[i])) {
                    usuarioOk = true;
                    break;
                }
            }
        } else usuarioOk = true;

        if (!usuarioOk) return false;

        boolean permisoOk = false;
        if (u != null && permissions != null && permissions.length > 0) {
            for (int i = 0; i < permissions.length; i++) {
                for (String p : u.getRoles()) {
                    if (("ROLE_" + permissions[i]).equals(p)) {
                        permisoOk = true;
                        break;
                    }
                    if (permisoOk) break;
                }
            }
        } else permisoOk = true;


        if (!permisoOk) return false;
        return true;
    }

    private static UserPrincipal getCurrentUser() {
        try {
            MateuSecurityManager sm = Helper.getImpl(MateuSecurityManager.class);
            UserPrincipal p = sm.getPrincipal(((WrappedHttpSession) VaadinSession.getCurrent().getSession()).getHttpSession());
            return p;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static boolean check(ReadOnly a) {
        return check(a.roles(), a.users());
    }

    public static boolean check(ReadWrite a) {
        return check(a.roles(), a.users());
    }

    public static boolean check(Forbidden a) {
        return check(a.roles(), a.users());
    }

    public static boolean isReadOnly(FieldInterfaced f) {
        if (f.isAnnotationPresent(ReadOnly.class)) {
            ReadOnly a = f.getAnnotation(ReadOnly.class);
            return check(a.roles(), a.users());
        } else return false;
    }

    public static boolean isReadWrite(Class<?> type) {
        boolean r = true;
        if (type.isAnnotationPresent(Forbidden.class)) {
            Forbidden a = type.getAnnotation(Forbidden.class);
            r &= !check(a.roles(), a.users());
        }
        if (type.isAnnotationPresent(ReadOnly.class)) {
            ReadOnly a = type.getAnnotation(ReadOnly.class);
            r &= !check(a.roles(), a.users());
        }
        return r;
    }
}
