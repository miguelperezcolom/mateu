package io.mateu.mdd.vaadinport.vaadin.data;

import com.google.common.base.Strings;
import com.vaadin.data.HasValue;
import com.vaadin.ui.CheckBox;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import javafx.beans.property.*;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MDDBinder {

    private Map<String, Property> vaadinSideProperties = new HashMap<>();
    private Map<String, Property> beanSideProperties = new HashMap<>();

    private List<ChangeNotificationListener> changeNotificationListeners = new ArrayList<>();

    private Class beanType;
    private Object bean;

    public MDDBinder(Class beanType) {
        this.beanType = beanType;
        createProperties(beanType);
    }

    public void addChangeNotificationListener(ChangeNotificationListener listener) {
        changeNotificationListeners.add(listener);
    }

    public void setBean(Object bean) {

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
        for (String n : beanSideProperties.keySet()) {
            Property vsp = vaadinSideProperties.get(n);
            Property bsp = beanSideProperties.get(n);
            vsp.setValue(bsp.getValue());
            bsp.bindBidirectional(vsp);
        }
    }

    private void createProperties(Class beanType) {
        createProperties(beanType, vaadinSideProperties);
    }

    private void createPropertiesAndBind(Class beanType, Map<String, Property> propertiesMap) {
        for (FieldInterfaced f : ReflectionHelper.getAllFields(beanType)) {
            propertiesMap.put(f.getName(), createPropertyAndBind(f));
        }
    }

    private void createProperties(Class beanType, Map<String, Property> propertiesMap) {
        for (FieldInterfaced f : ReflectionHelper.getAllFields(beanType)) {
            propertiesMap.put(f.getName(), createProperty(f));
        }
    }

    private Property createProperty(FieldInterfaced f) {
        Class t = f.getType();
        Property p = null;
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
        } else {
            p = new SimpleObjectProperty(bean, f.getName());
        }
        return p;
    }

    private Property createPropertyAndBind(FieldInterfaced f) {
        Class t = f.getType();
        Property p = null;
        if (Integer.class.equals(t) || int.class.equals(t)) {
            p = new SimpleIntegerProperty(bean, f.getName(), (Integer) getValue(f, bean));
        } else if (Long.class.equals(t) || long.class.equals(t)) {
            p = new SimpleLongProperty(bean, f.getName(), (Long) getValue(f, bean));
        } else if (Float.class.equals(t) || float.class.equals(t)) {
            p = new SimpleFloatProperty(bean, f.getName(), (Float) getValue(f, bean));
        } else if (Double.class.equals(t) || double.class.equals(t)) {
            p = new SimpleDoubleProperty(bean, f.getName(), (Double) getValue(f, bean));
        } else if (Boolean.class.equals(t) || boolean.class.equals(t)) {
            p = new SimpleBooleanProperty(bean, f.getName(), (Boolean) getValue(f, bean));
        } else if (String.class.equals(t)) {
            p = new SimpleStringProperty(bean, f.getName(), (String) getValue(f, bean));
        } else {
            p = new SimpleObjectProperty(bean, f.getName(), getValue(f, bean));
        }
        p.addListener(new ChangeListener() {
            @Override
            public void changed(ObservableValue observable, Object oldValue, Object newValue) {
                try {
                    ReflectionHelper.setValue(f, bean, newValue);

                    for (FieldInterfaced f : ReflectionHelper.getAllFields(beanType)) {
                        beanSideProperties.get(f.getName()).setValue(ReflectionHelper.getValue(f, bean));
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
        try {
            return ReflectionHelper.getValue(f, bean);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
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

    public void bindAnythingToString(TextField tf, String name) {
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
}
