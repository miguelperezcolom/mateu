package io.mateu.mdd.vaadinport.vaadin.data;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.event.selection.MultiSelectionEvent;
import com.vaadin.event.selection.MultiSelectionListener;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import javafx.beans.property.*;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableSet;
import javafx.collections.SetChangeListener;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

public class MDDBinder {

    List<AbstractComponent> fields = new ArrayList<>();

    private Map<String, Property> vaadinSideProperties = new HashMap<>();
    private Map<String, Property> beanSideProperties = new HashMap<>();

    private List<Object> mergeables = new ArrayList<>();

    private List<ChangeNotificationListener> changeNotificationListeners = new ArrayList<>();

    private Class beanType;
    private Object bean;

    public MDDBinder(Class beanType) {
        this.beanType = beanType;
        createProperties(beanType);
    }

    public List<Object> getMergeables() {
        return mergeables;
    }

    public void addChangeNotificationListener(ChangeNotificationListener listener) {
        changeNotificationListeners.add(listener);
    }

    public void setBean(Object bean) {
        setBean(bean, true);
    }

    public void setBean(Object bean, boolean reset) {

        if (bean == null) {
            try {
                bean = beanType.newInstance();
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }

        this.bean = bean;

        if (beanType == null) {
            beanType = bean.getClass();

            createProperties(beanType);
        }

        for (Property p : beanSideProperties.values()) {
            p.unbind();
        }
        beanSideProperties.clear();
        createPropertiesAndBind(beanType, beanSideProperties);
        if (Map.class.isAssignableFrom(beanType)) {
            Map m = (Map) bean;
            for (String n : vaadinSideProperties.keySet()) {
                Property vsp = vaadinSideProperties.get(n);
                if (m != null && m.containsKey(n)) {
                    vsp.setValue(m.get(n));
                }
                vsp.addListener(new ChangeListener() {
                    @Override
                    public void changed(ObservableValue observable, Object oldValue, Object newValue) {
                        m.put(n, newValue);
                    }
                });
            }
        } else {
            for (String n : beanSideProperties.keySet()) {
                Property vsp = vaadinSideProperties.get(n);
                Property bsp = beanSideProperties.get(n);
                if (vsp != null && bsp != null) {
                    vsp.setValue(bsp.getValue());
                    bsp.bindBidirectional(vsp);
                }
            }
        }

        if (reset) mergeables = new ArrayList<>();
    }

    private void createProperties(Class beanType) {
        createProperties(beanType, vaadinSideProperties);
    }

    private void createPropertiesAndBind(Class beanType, Map<String, Property> propertiesMap) {
        if (!Map.class.isAssignableFrom(beanType)) for (FieldInterfaced f : ReflectionHelper.getAllFields(beanType)) {
            if (f.isAnnotationPresent(UseLinkToListView.class) && Collection.class.isAssignableFrom(f.getType())) {
                Collection col = null;
                try {
                    col = (Collection) ReflectionHelper.getValue(f, bean);
                } catch (Exception e) {
                    MDD.alert(e);
                }
                propertiesMap.put(f.getName() + "_size", new SimpleIntegerProperty((col != null)?col.size():0));
            } else {
                propertiesMap.put(f.getName(), createPropertyAndBind(f));
            }
        }
    }

    private void createProperties(Class beanType, Map<String, Property> propertiesMap) {
        if (!Map.class.isAssignableFrom(beanType)) for (FieldInterfaced f : ReflectionHelper.getAllFields(beanType)) {
            if (f.isAnnotationPresent(UseLinkToListView.class)) {
                propertiesMap.put(f.getName() + "_size", new SimpleIntegerProperty());
            } else {
                propertiesMap.put(f.getName(), createProperty(f));
            }
        }
    }

    private Property createProperty(FieldInterfaced f) {
        Class t = f.getType();
        Property p = null;
        if (Map.class.isAssignableFrom(beanType)) {
            if (Integer.class.equals(t) || int.class.equals(t)) {
                p = new SimpleIntegerProperty();
            } else if (Long.class.equals(t) || long.class.equals(t)) {
                p = new SimpleLongProperty();
            } else if (Float.class.equals(t) || float.class.equals(t)) {
                p = new SimpleFloatProperty();
            } else if (Double.class.equals(t) || double.class.equals(t)) {
                p = new SimpleDoubleProperty();
            } else if (Boolean.class.equals(t) || boolean.class.equals(t)) {
                p = new SimpleBooleanProperty();
            } else if (String.class.equals(t)) {
                p = new SimpleStringProperty();
            } else if (Collection.class.isAssignableFrom(t)) {
                p = new SimpleSetProperty();
            } else {
                p = new SimpleObjectProperty();
            }
            p.addListener(new ChangeListener() {
                @Override
                public void changed(ObservableValue observable, Object oldValue, Object newValue) {
                    ((Map) bean).put(f.getName(), newValue);
                }
            });

        } else {
            if (Integer.class.equals(t) || int.class.equals(t)) {
                p = new SimpleIntegerProperty(bean, f.getName());
            } else if (Long.class.equals(t) || long.class.equals(t)) {
                p = new SimpleLongProperty(bean, f.getName());
            } else if (Float.class.equals(t) || float.class.equals(t)) {
                p = new SimpleFloatProperty(bean, f.getName());
            } else if (Double.class.equals(t) || double.class.equals(t)) {
                p = new SimpleDoubleProperty(bean, f.getName());
            } else if (Boolean.class.equals(t) || boolean.class.equals(t)) {
                p = new SimpleBooleanProperty(bean, f.getName());
            } else if (String.class.equals(t)) {
                p = new SimpleStringProperty(bean, f.getName());
            } else if (Collection.class.isAssignableFrom(t)) {
                p = new SimpleSetProperty(bean, f.getName());
            } else {
                p = new SimpleObjectProperty(bean, f.getName());
            }
        }
        return p;
    }

    private Property createPropertyAndBind(FieldInterfaced f) {
        Class t = f.getType();
        Property p = null;

        boolean fake = false;

        if (Map.class.isAssignableFrom(beanType)) {

            Object v = getValue(f, bean);

            if (Integer.class.equals(t) || int.class.equals(t)) {
                p = new SimpleIntegerProperty();
            } else if (Long.class.equals(t) || long.class.equals(t)) {
                p = new SimpleLongProperty();
            } else if (Float.class.equals(t) || float.class.equals(t)) {
                p = new SimpleFloatProperty();
            } else if (Double.class.equals(t) || double.class.equals(t)) {
                p = new SimpleDoubleProperty();
            } else if (Boolean.class.equals(t) || boolean.class.equals(t)) {
                p = new SimpleBooleanProperty();
            } else if (String.class.equals(t)) {
                p = new SimpleStringProperty();
            } else if (Collection.class.isAssignableFrom(t)) {
                ObservableSet<Object> s = FXCollections.observableSet();
                Collection col = (Collection) v;
                if (col != null) s.addAll(col);
                p = new SimpleSetProperty(s);

                s.addListener(new SetChangeListener<Object>() {
                    @Override
                    public void onChanged(Change<?> change) {
                        try {
                            List l = (List) ReflectionHelper.getValue(f, bean);
                            if (l == null) {
                                ReflectionHelper.setValue(f, bean, l = new ArrayList());
                            }

                            if (change.wasRemoved()) l.remove(change.getElementRemoved());
                            if (change.wasAdded()) l.add(change.getElementAdded());

                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        }
                    }
                });

            } else {
                p = new SimpleObjectProperty(v);
            }

            p.addListener(new ChangeListener() {
                @Override
                public void changed(ObservableValue observable, Object oldValue, Object newValue) {
                    ((Map)bean).put(f.getName(), newValue);
                }
            });
        } else {


            if (f.isAnnotationPresent(UseLinkToListView.class) && Collection.class.isAssignableFrom(f.getType())) {
                p = new SimpleIntegerProperty();

                if (bean != null) {

                    try {
                        f.getType().getMethod("size").invoke(ReflectionHelper.getValue(f, bean));
                    } catch (Exception e) {
                        MDD.alert(e);
                    }

                }

                fake = true;
            } else {

                Object v = getValue(f, bean);

                if (Integer.class.equals(t) || int.class.equals(t)) {
                    p = new SimpleIntegerProperty(bean, f.getName());
                } else if (Long.class.equals(t) || long.class.equals(t)) {
                    p = new SimpleLongProperty(bean, f.getName());
                } else if (Float.class.equals(t) || float.class.equals(t)) {
                    p = new SimpleFloatProperty(bean, f.getName());
                } else if (Double.class.equals(t) || double.class.equals(t)) {
                    p = new SimpleDoubleProperty(bean, f.getName());
                } else if (Boolean.class.equals(t) || boolean.class.equals(t)) {
                    p = new SimpleBooleanProperty(bean, f.getName());
                } else if (String.class.equals(t)) {
                    p = new SimpleStringProperty(bean, f.getName());
                } else if (Collection.class.isAssignableFrom(t)) {
                    ObservableSet<Object> s = FXCollections.observableSet();
                    Collection col = (Collection) v;
                    if (col != null) s.addAll(col);
                    p = new SimpleSetProperty(bean, f.getName(), s);

                    s.addListener(new SetChangeListener<Object>() {
                        @Override
                        public void onChanged(Change<?> change) {
                            try {
                                List l = (List) v;
                                if (l == null) {
                                    ReflectionHelper.setValue(f, bean, l = new ArrayList());
                                }

                                if (change.wasRemoved()) l.remove(change.getElementRemoved());
                                if (change.wasAdded()) l.add(change.getElementAdded());

                            } catch (NoSuchMethodException e) {
                                e.printStackTrace();
                            } catch (IllegalAccessException e) {
                                e.printStackTrace();
                            } catch (InvocationTargetException e) {
                                e.printStackTrace();
                            }
                        }
                    });

                } else {
                    p = new SimpleObjectProperty(bean, f.getName(), v);
                }

                if (v != null) {
                    if (Collection.class.isAssignableFrom(t)) {
                        SimpleSetProperty ssp = (SimpleSetProperty) p;
                        ssp.getValue().addAll((Collection) v);
                    } else p.setValue(v);
                }

            }

        }
        if (!fake) p.addListener(new ChangeListener() {
            @Override
            public void changed(ObservableValue observable, Object oldValue, Object newValue) {
                try {
                    ReflectionHelper.setValue(f, bean, newValue);

                    for (FieldInterfaced f : ReflectionHelper.getAllFields(beanType)) {
                        if (!f.isAnnotationPresent(UseLinkToListView.class)) {

                            Object v = ReflectionHelper.getValue(f, bean);
                            if (v != null && List.class.isAssignableFrom(v.getClass())) {
                                SimpleSetProperty p = (SimpleSetProperty) beanSideProperties.get(f.getName());
                                Collection col = (Collection) v;
                                p.retainAll(col);
                                p.addAll((Collection) col.stream().filter(e -> !p.contains(e)).collect(Collectors.toList()));
                            } else {
                                beanSideProperties.get(f.getName()).setValue(v);
                            }

                        }

                    }

                    changeNotificationListeners.forEach((l) -> l.somethingChanged());

                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (NoSuchMethodException e) {
                    e.printStackTrace();
                }
            }
        });
        return p;
    }

    private Object getValue(FieldInterfaced f, Object bean) {

        if (Map.class.isAssignableFrom(bean.getClass())) {

            return ((Map)bean).get(f.getName());

        } else {

            try {
                return ReflectionHelper.getValue(f, bean);
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }

        }

        return null;
    }

    public Map<String, Property> getVaadinSideProperties() {
        return vaadinSideProperties;
    }

    public Object getBean() {
        return bean;
    }

    public void bindInteger(TextField tf, String name) {
        fields.add(tf);
        SimpleIntegerProperty p = (SimpleIntegerProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleIntegerProperty();
            vaadinSideProperties.put(name, p);
        } else tf.setValue((p.getValue() == null)?"":"" + p.getValue());
        p.addListener(new ChangeListener<Number>() {
            @Override
            public void changed(ObservableValue<? extends Number> observable, Number oldValue, Number newValue) {
                tf.setValue((newValue == null)?"":"" + newValue);
            }
        });
        SimpleIntegerProperty finalP = p;
        tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) {
                    try {
                        finalP.setValue((Strings.isNullOrEmpty(valueChangeEvent.getValue())?null:Integer.parseInt(valueChangeEvent.getValue())));
                    } catch (Exception e) {

                    }
                }
            }
        });
    }

    public void bindLong(TextField tf, String name) {
        fields.add(tf);
        SimpleLongProperty p = (SimpleLongProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleLongProperty();
            vaadinSideProperties.put(name, p);
        } else tf.setValue((p.getValue() == null)?"":"" + p.getValue());
        p.addListener(new ChangeListener<Number>() {
            @Override
            public void changed(ObservableValue<? extends Number> observable, Number oldValue, Number newValue) {
                tf.setValue((newValue == null)?"":"" + newValue);
            }
        });
        SimpleLongProperty finalP = p;
        tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) {
                    try {
                        finalP.setValue((Strings.isNullOrEmpty(valueChangeEvent.getValue())?null:Long.parseLong(valueChangeEvent.getValue())));
                    } catch (Exception e) {

                    }
                }
            }
        });
    }

    public void bindFloat(TextField tf, String name) {
        fields.add(tf);
        SimpleFloatProperty p = (SimpleFloatProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleFloatProperty();
            vaadinSideProperties.put(name, p);
        } else tf.setValue((p.getValue() == null)?"":"" + p.getValue());
        p.addListener(new ChangeListener<Number>() {
            @Override
            public void changed(ObservableValue<? extends Number> observable, Number oldValue, Number newValue) {
                tf.setValue((newValue == null)?"":"" + newValue);
            }
        });
        SimpleFloatProperty finalP = p;
        tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) {
                    try {
                        finalP.setValue((Strings.isNullOrEmpty(valueChangeEvent.getValue())?null:Float.parseFloat(valueChangeEvent.getValue())));
                    } catch (Exception e) {

                    }
                }
            }
        });
    }


    public void bindDouble(TextField tf, String name) {
        fields.add(tf);
        SimpleDoubleProperty p = (SimpleDoubleProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleDoubleProperty();
            vaadinSideProperties.put(name, p);
        } else tf.setValue((p.getValue() == null)?"":"" + p.getValue());
        p.addListener(new ChangeListener<Number>() {
            @Override
            public void changed(ObservableValue<? extends Number> observable, Number oldValue, Number newValue) {
                tf.setValue((newValue == null)?"":"" + newValue);
            }
        });
        SimpleDoubleProperty finalP = p;
        tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) {
                    try {
                        finalP.setValue((Strings.isNullOrEmpty(valueChangeEvent.getValue())?null:Double.parseDouble(valueChangeEvent.getValue())));
                    } catch (Exception e) {

                    }
                }
            }
        });
    }

    public void bindString(TextField tf, String name) {
        fields.add(tf);
        SimpleStringProperty p = (SimpleStringProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleStringProperty();
            vaadinSideProperties.put(name, p);
        } else tf.setValue((p.getValue() == null)?"":p.getValue());
        p.addListener(new ChangeListener<String>() {
            @Override
            public void changed(ObservableValue<? extends String> observable, String oldValue, String newValue) {
                tf.setValue((newValue == null)?"":newValue);
            }
        });
        SimpleStringProperty finalP = p;
        tf.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) finalP.setValue(valueChangeEvent.getValue());
            }
        });
    }

    public void bindBoolean(CheckBox cb, String name) {
        fields.add(cb);
        SimpleBooleanProperty p = (SimpleBooleanProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleBooleanProperty();
            vaadinSideProperties.put(name, p);
        } else cb.setValue((p.getValue() == null)?false:p.getValue());
        p.addListener(new ChangeListener<Boolean>() {
            @Override
            public void changed(ObservableValue<? extends Boolean> observable, Boolean oldValue, Boolean newValue) {
                cb.setValue((newValue == null)?false:newValue);
            }
        });
        SimpleBooleanProperty finalP = p;
        cb.addValueChangeListener(new HasValue.ValueChangeListener<Boolean>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<Boolean> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) finalP.setValue(valueChangeEvent.getValue());
            }
        });
    }

    public void bindLocalDate(DateField df, String name) {
        fields.add(df);
        SimpleObjectProperty p = (SimpleObjectProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleObjectProperty();
            vaadinSideProperties.put(name, p);
        } else df.setValue((LocalDate) p.getValue());
        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                df.setValue((LocalDate) newValue);
            }
        });
        SimpleObjectProperty finalP = p;
        df.addValueChangeListener(new HasValue.ValueChangeListener<LocalDate>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<LocalDate> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) finalP.setValue(valueChangeEvent.getValue());
            }
        });
    }

    public void bindLocalDateTime(DateTimeField df, String name) {
        fields.add(df);
        SimpleObjectProperty p = (SimpleObjectProperty) vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleObjectProperty();
            vaadinSideProperties.put(name, p);
        } else df.setValue((LocalDateTime) p.getValue());
        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                df.setValue((LocalDateTime) newValue);
            }
        });
        SimpleObjectProperty finalP = p;
        df.addValueChangeListener(new HasValue.ValueChangeListener<LocalDateTime>() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent<LocalDateTime> valueChangeEvent) {
                if (valueChangeEvent.isUserOriginated()) finalP.setValue(valueChangeEvent.getValue());
            }
        });
    }


    public void bindAnythingToString(TextField tf, String name) {
        fields.add(tf);
        Property p = vaadinSideProperties.get(name);
        if (p == null) {
            p = new SimpleStringProperty();
            vaadinSideProperties.put(name, p);
        } else tf.setValue((p.getValue() == null)?"":"" + p.getValue());
        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                tf.setValue((newValue == null)?"":"" + newValue);
            }
        });
    }

    public void bindEnum(ComboBox c, String fieldName) {
        fields.add(c);
        Property p = vaadinSideProperties.get(fieldName);
        if (p == null) {
            p = new SimpleObjectProperty();
            vaadinSideProperties.put(fieldName, p);
        } else c.setValue(p.getValue());
        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                c.setValue(newValue);
            }
        });
        Property finalP = p;
        c.addValueChangeListener(new HasValue.ValueChangeListener() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent valueChangeEvent) {
                finalP.setValue(valueChangeEvent.getValue());
            }
        });
    }

    public void bindOneToOne(ComboBox c, String fieldName) {
        fields.add(c);
        Property p = vaadinSideProperties.get(fieldName);
        if (p == null) {
            p = new SimpleObjectProperty();
            vaadinSideProperties.put(fieldName, p);
        } else c.setValue(p.getValue());
        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                c.setValue(newValue);
            }
        });
        Property finalP = p;
        c.addValueChangeListener(new HasValue.ValueChangeListener() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent valueChangeEvent) {
                if (valueChangeEvent.getOldValue() != null) {
                    FieldInterfaced mapper = ReflectionHelper.getMapper(valueChangeEvent.getOldValue().getClass(), fieldName);
                    if (mapper == null) {
                        mapper = ReflectionHelper.getMapper(beanType, fieldName, valueChangeEvent.getOldValue().getClass());
                    }
                    if (mapper != null) {
                        try {
                            ReflectionHelper.setValue(mapper, valueChangeEvent.getOldValue(), null);
                            if (!mergeables.contains(valueChangeEvent.getOldValue())) mergeables.add(valueChangeEvent.getOldValue());
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        }
                    }
                }
                if (valueChangeEvent.getValue() != null) {
                    FieldInterfaced mapper = ReflectionHelper.getMapper(valueChangeEvent.getValue().getClass(), fieldName);
                    if (mapper == null) {
                        mapper = ReflectionHelper.getMapper(beanType, fieldName, valueChangeEvent.getValue().getClass());
                    }
                    if (mapper != null) {

                        try {
                            Object oldValue = ReflectionHelper.getValue(mapper, valueChangeEvent.getValue());

                            if (oldValue != null) {
                                ReflectionHelper.setValue(ReflectionHelper.getFieldByName(beanType, fieldName), oldValue, null);
                                if (!mergeables.contains(oldValue)) mergeables.add(oldValue);
                            }
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        }

                        try {
                            ReflectionHelper.setValue(mapper, valueChangeEvent.getValue(), bean);
                            if (!mergeables.contains(valueChangeEvent.getValue())) mergeables.add(valueChangeEvent.getValue());
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        }
                    }
                }

                finalP.setValue(valueChangeEvent.getValue());
            }
        });
    }

    public void bindManyToOne(HasValue c, String fieldName) {
        fields.add((AbstractComponent) c);
        Property p = vaadinSideProperties.get(fieldName);
        if (p == null) {
            p = new SimpleObjectProperty();
            vaadinSideProperties.put(fieldName, p);
        } else {
            if (!(c instanceof TextField) || p.getValue() != null) c.setValue(p.getValue());
        }
        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                c.setValue(newValue);
            }
        });
        Property finalP = p;
        c.addValueChangeListener(new HasValue.ValueChangeListener() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent valueChangeEvent) {
                if (valueChangeEvent.getOldValue() != null) {
                    FieldInterfaced mapper = ReflectionHelper.getMapper(valueChangeEvent.getOldValue().getClass(), fieldName);
                    if (mapper == null) {
                        mapper = ReflectionHelper.getMapper(beanType, fieldName, valueChangeEvent.getOldValue().getClass());
                    }
                    if (mapper != null) {
                        try {
                            List l = (List)ReflectionHelper.getValue(mapper, valueChangeEvent.getOldValue());
                            if (l.contains(bean)){
                                l.remove(bean);
                                if (!mergeables.contains(valueChangeEvent.getOldValue())) mergeables.add(valueChangeEvent.getOldValue());
                            }
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        }
                    }
                }
                if (valueChangeEvent.getValue() != null) {
                    FieldInterfaced mapper = ReflectionHelper.getMapper(valueChangeEvent.getValue().getClass(), fieldName);
                    if (mapper == null) {
                        mapper = ReflectionHelper.getMapper(beanType, fieldName, valueChangeEvent.getValue().getClass());
                    }
                    if (mapper != null) {

                        try {
                            List l = (List)ReflectionHelper.getValue(mapper, valueChangeEvent.getValue());
                            if (!l.contains(bean)) {
                                l.add(bean);
                                if (!mergeables.contains(valueChangeEvent.getValue())) mergeables.add(valueChangeEvent.getValue());
                            }
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        }

                    }
                }

                finalP.setValue(valueChangeEvent.getValue());
            }
        });
    }

    public void bindOneToMany(TwinColSelect<Object> c, String fieldName) {
        fields.add(c);
        Property p = vaadinSideProperties.get(fieldName);
        if (p == null) {
            p = new SimpleSetProperty();
            vaadinSideProperties.put(fieldName, p);
        } else {
            if (p.getValue() != null) c.setValue(((SimpleSetProperty)p).getValue());
        }
        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                Collection col = (Collection) newValue;
                //((JPQLListDataProvider)c.getDataProvider()).getItems().contains(col.iterator().next())
                c.updateSelection(
                        (Set<Object>) col.stream().filter(e -> !c.getSelectedItems().contains(e)).collect(Collectors.toSet()),
                        c.getSelectedItems().stream().filter(e -> !col.contains(e)).collect(Collectors.toSet())
                );
            }
        });
        Property finalP = p;
        c.addValueChangeListener(new HasValue.ValueChangeListener() {
            @Override
            public void valueChange(HasValue.ValueChangeEvent valueChangeEvent) {
                Class genericClass = ReflectionHelper.getFieldByName(beanType, fieldName).getGenericClass();

                // recogemos los elementos eliminados y los no eliminados
                Set old = (Set) valueChangeEvent.getOldValue();
                Set value = (Set) valueChangeEvent.getValue();

                List removed = (List) old.stream().filter(e -> !value.contains(e)).collect(Collectors.toList());
                List added = (List) value.stream().filter(e -> !old.contains(e)).collect(Collectors.toList());

                if (removed.size() > 0) {
                    FieldInterfaced mapper = ReflectionHelper.getMapper(genericClass, fieldName);
                    if (mapper == null) {
                        mapper = ReflectionHelper.getMapper(beanType, fieldName, genericClass);
                    }
                    if (mapper != null) {
                        try {
                            for (Object o : removed) {
                                Object v = ReflectionHelper.getValue(mapper, o);
                                if (List.class.isAssignableFrom(mapper.getType())) {
                                    ((List)v).remove(bean);
                                } else {
                                    ReflectionHelper.setValue(mapper, o, null);
                                }
                                if (!mergeables.contains(o)) mergeables.add(o);
                            }
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        }
                    }

                }
                if (added.size() > 0) {
                    FieldInterfaced mapper = ReflectionHelper.getMapper(genericClass, fieldName);
                    if (mapper == null) {
                        mapper = ReflectionHelper.getMapper(beanType, fieldName, genericClass);
                    }
                    if (mapper != null) {

                        try {
                            for (Object o : added) {
                                Object v = ReflectionHelper.getValue(mapper, o);
                                if (List.class.isAssignableFrom(mapper.getType())) {
                                    List l = ((List)v);
                                    if (!l.contains(bean)) l.add(bean);
                                } else {
                                    ReflectionHelper.setValue(mapper, o, bean);
                                }
                                if (!mergeables.contains(o)) mergeables.add(o);
                            }
                        } catch (NoSuchMethodException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        } catch (InvocationTargetException e) {
                            e.printStackTrace();
                        }

                    }
                }

                Set v = ((SimpleSetProperty) finalP);
                v.removeAll(removed);
                v.addAll(added);
            }
        });
    }



    public void bindOneToMany(Label l, String fieldName) {
        fields.add(l);

        Property p = vaadinSideProperties.get(fieldName + "_size");
        if (p == null) {
            p = new SimpleIntegerProperty();
            vaadinSideProperties.put(fieldName + "_size", p);
        } else {
            if (p.getValue() != null) {
                l.setValue("" + p.getValue() + " " + Helper.pluralize(Helper.capitalize(fieldName)) + " related");
            }
        }

        p.addListener(new ChangeListener() {
            @Override
            public void changed(ObservableValue observable, Object oldValue, Object newValue) {
                l.setValue("" + newValue + " " + Helper.pluralize(Helper.capitalize(fieldName)) + " related");
            }
        });

    }

    public void bindOneToMany(Grid g, String fieldName) {
        fields.add(g);

        ListDataProvider ldp;
        g.setDataProvider(ldp = new ListDataProvider(new ArrayList()));

        Property p = vaadinSideProperties.get(fieldName);
        if (p == null) {
            p = new SimpleSetProperty();
            vaadinSideProperties.put(fieldName, p);
        } else {
            if (p.getValue() != null) {
                ldp.getItems().addAll(((SimpleSetProperty)p).getValue());
            }
        }
        if (!g.getEditor().isEnabled()) g.setHeightByRows((ldp.getItems().size() > 0)?ldp.getItems().size():1);

        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                Collection col = (Collection) newValue;
                ldp.getItems().clear();
                ldp.getItems().addAll(col);
                if (!g.getEditor().isEnabled()) g.setHeightByRows((ldp.getItems().size() > 0)?ldp.getItems().size():1);
                g.getDataProvider().refreshAll();
            }
        });
    }


    public boolean allValid() {
        boolean ok = true;
        for (AbstractComponent x : fields) ok &= x.getErrorMessage() == null;
        return ok;
    }

    public void bindOneToMany(CheckBoxGroup cbg, FieldInterfaced field) {
        fields.add(cbg);

        cbg.deselectAll();

        ListDataProvider ldp = (ListDataProvider) cbg.getDataProvider();

        Property p = vaadinSideProperties.get(field.getName());
        if (p == null) {
            p = new SimpleSetProperty();
            vaadinSideProperties.put(field.getName(), p);
        } else {
            if (p.getValue() != null) {
                Collection col = ((SimpleSetProperty)p).getValue();
                col.forEach(o -> cbg.select(o));
            }
        }

        p.addListener(new ChangeListener<Object>() {
            @Override
            public void changed(ObservableValue<? extends Object> observable, Object oldValue, Object newValue) {
                cbg.deselectAll();

                Collection col = (Collection) newValue;
                col.forEach(o -> cbg.select(o));
            }
        });

        cbg.addSelectionListener(e -> {
            try {
                Collection col = (Collection) ReflectionHelper.getValue(field, bean);
                col.clear();
                col.addAll(e.getNewSelection());
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });
    }
}
