package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import javafx.util.Pair;

import javax.persistence.Id;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractStylist<S> {

    private String viewTitle;

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
        Method m = ReflectionHelper.getMethod(getClass(), ReflectionHelper.getGetter(field) + "Styles");
        if (m != null) {
            try {
                return (List<String>) m.invoke(this, model);
            } catch (Exception e) {
                MDD.alert(e);
            }
        }
        return null;
    };


    public String getViewTitle() {
        return Helper.pluralize(Helper.capitalize(viewTitle));
    }

    public String getViewTitle(boolean newRecord, S model) {
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
            return "" + viewTitle + " " + id;
        }
    }

    public void setViewTitle(String viewTitle) {
        this.viewTitle = viewTitle;
    }

    public boolean isVisible(FieldInterfaced f, Object model) {
        Method m = ReflectionHelper.getMethod(getClass(), ReflectionHelper.getGetter(f).replaceFirst("get", "is") + "Visible");
        if (m != null) {
            try {
                return (boolean) m.invoke(this, model);
            } catch (Exception e) {
                MDD.alert(e);
            }
        }
        return true;
    }
}
