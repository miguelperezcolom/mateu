package io.mateu.mdd.core.interfaces;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Css;
import io.mateu.mdd.shared.annotations.EnabledIf;
import io.mateu.mdd.shared.annotations.VisibleIf;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.data.Pair;
import io.mateu.util.notification.Notifier;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;

public abstract class AbstractStylist<S> {

    private String viewTitle;
    private String viewSubtitle;

    private Map<FieldInterfaced, List<String>> styles = new HashMap<>();

    public void setUp(List<FieldInterfaced> fields) {
        for (FieldInterfaced f : fields) styles.put(f, new ArrayList<>());
    }

    private Pair<Map<FieldInterfaced, List<String>>, Map<FieldInterfaced, List<String>>> getStyleChanges(Map<FieldInterfaced, List<String>> newStyles) {

        Map<FieldInterfaced, List<String>> removed = new HashMap<>();
        Map<FieldInterfaced, List<String>> added = new HashMap<>();

        for (FieldInterfaced f : styles.keySet()) {
            List<String> old = styles.get(f);
            if (old == null) old = new ArrayList<>();
            List<String> next = newStyles.get(f);
            if (next == null) next = new ArrayList<>();

            List<String> remove = new ArrayList<>();
            List<String> add = new ArrayList<>();

            for (String s : old) if (!next.contains(s)) remove.add(s);
            for (String s : next) if (!old.contains(s)) add.add(s);

            removed.put(f, remove);
            added.put(f, add);

        }


        styles = newStyles;

        return new Pair<>(removed, added);
    }

    public Pair<Map<FieldInterfaced, List<String>>, Map<FieldInterfaced, List<String>>> process(S model) {
        Map<FieldInterfaced, List<String>> newStyles = new HashMap<>();
        styles.keySet().forEach((f) -> newStyles.put(f, new ArrayList<>()));
        for (FieldInterfaced f : styles.keySet()) {
            newStyles.put(f, style(f, model));
        }
        return getStyleChanges(newStyles);
    }


    public List<String> style(FieldInterfaced field, S model) {
        List<String> l = new ArrayList<>();
        Method m = ReflectionHelper.getMethod(getStylistClass(), ReflectionHelper.getGetter(field) + "Styles");
        if (m != null) {
            try {
                return (getStylistClass().equals(getClass()))?(List<String>) m.invoke(this, model):(List<String>) m.invoke(model);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
        if (field.isAnnotationPresent(Css.class) && !Strings.isNullOrEmpty(field.getAnnotation(Css.class).value())) {
            String s = field.getAnnotation(Css.class).value();
            String r = Helper.eval("javascript", s, Helper.hashmap("$this", model));
            if (!Strings.isNullOrEmpty(r)) l = Arrays.asList(r.split(" "));
        }
        return l;
    };

    public String getViewSubtitle() {
        return viewSubtitle;
    }


    public String getViewTitle(boolean newRecord, S model) {
        if (model != null && (model instanceof ReadOnlyPojo || model instanceof PersistentPojo)) {
            Class<?> modelType = model.getClass();
            if (modelType.isAnnotationPresent(Caption.class)) {
                return ((Caption)modelType.getAnnotation(Caption.class)).value();
            }
            String viewTitle = "";
            if (model != null && model instanceof ReadOnlyPojo) viewTitle = ((ReadOnlyPojo) model).getEntityName();
            if (model != null && model instanceof PersistentPojo) {
                viewTitle = ((PersistentPojo) model).getEntityName();
                if (((PersistentPojo) model).isNew()) return "New " + viewTitle;
            }
            String prefix = "";
            if (!"".equals(viewTitle)) prefix = viewTitle + " ";
            return prefix + model;
        } else if (model != null && !(model instanceof PersistentPojo || model.getClass().isAnnotationPresent(Entity.class))) {
            if (model.getClass().isAnnotationPresent(Caption.class)) return model.getClass().getAnnotation(Caption.class).value();
            Method toString = ReflectionHelper.getMethod(model.getClass(), "toString");
            if (toString == null || toString.getDeclaringClass().equals(Object.class)) return  Helper.capitalize(model.getClass().getSimpleName());
            return "" + model;
        } else {
            if (newRecord || model == null) return "New " + viewTitle;
            else {
                String id = "";
                Method toString = ReflectionHelper.getMethod(model.getClass(), "toString");
                if (toString != null) {
                    try {
                        id = (String) toString.invoke(model);
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    } catch (InvocationTargetException e) {
                        e.printStackTrace();
                    }
                } else {
                    for (FieldInterfaced f : ReflectionHelper.getAllFields(model.getClass())) {
                        if (f.isAnnotationPresent(Id.class)) {
                            if (!"".equals(id)) id += " - ";
                            try {
                                id += ReflectionHelper.getValue(f, model);
                            } catch (NoSuchMethodException e) {
                                e.printStackTrace();
                            } catch (IllegalAccessException e) {
                                e.printStackTrace();
                            } catch (InvocationTargetException e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
                return id != null && viewTitle != null && id.startsWith(viewTitle)?id:"" + viewTitle + " " + id;
            }
        }
    }

    public void setViewTitle(String viewTitle) {
        this.viewTitle = viewTitle;
    }

    public void setViewSubtitle(String viewSubtitle) {
        this.viewSubtitle = viewSubtitle;
    }
    public boolean isEnabled(FieldInterfaced f, Object model) {
        Method m = ReflectionHelper.getMethod(getStylistClass(), ReflectionHelper.getGetter(f).replaceFirst("get", "is") + "Enabled");
        if (m != null) {
            try {
                return (getStylistClass().equals(getClass()))?(boolean) m.invoke(this, model):(boolean) m.invoke(model);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        } else if (f.isAnnotationPresent(EnabledIf.class) && !Strings.isNullOrEmpty(f.getAnnotation(EnabledIf.class).value())) {
            String s = f.getAnnotation(EnabledIf.class).value();
            String r = Helper.eval("javascript", s, Helper.hashmap("$this", model));
            return "true".equalsIgnoreCase(r);
        }
        return true;
    }

    public boolean isVisible(FieldInterfaced f, Object model) {
        Method m = ReflectionHelper.getMethod(getStylistClass(), ReflectionHelper.getGetter(f).replaceFirst("get", "is") + "Visible");
        if (m != null) {
            try {
                return (getStylistClass().equals(getClass()))?(boolean) m.invoke(this, model):(boolean) m.invoke(model);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        } else if (f.isAnnotationPresent(VisibleIf.class) && !Strings.isNullOrEmpty(f.getAnnotation(VisibleIf.class).value())) {
            String s = f.getAnnotation(VisibleIf.class).value();
            String r = Helper.eval("javascript", s, Helper.hashmap("$this", model));
            return "true".equalsIgnoreCase(r);
        }
        return true;
    }

    public boolean isActionEnabled(String k, Object model) {
        boolean enabled = true;
        Method m = ReflectionHelper.getMethod(getStylistClass(), "is" + (k.substring(0, 1).toUpperCase() + k.substring(1)) + "Enabled");
        if (m != null) {
            try {
                return (getStylistClass().equals(getClass()))?(boolean) m.invoke(this, model):(boolean) m.invoke(model);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
        return enabled;
    }

    public Class getStylistClass() {
        return getClass();
    }
}
