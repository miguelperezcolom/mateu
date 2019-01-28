package io.mateu.mdd.core.data;

import com.vaadin.data.Binder;
import com.vaadin.data.PropertyDefinition;
import com.vaadin.data.PropertySet;
import com.vaadin.data.ValueProvider;
import com.vaadin.server.Setter;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;

import java.util.*;
import java.util.stream.Stream;

public class MDDBinder extends Binder {

    private AbstractViewComponent viewComponent;
    private final Class beanType;
    private List<Object> mergeables = new ArrayList<>();
    private List<Object> removables = new ArrayList<>();

    public MDDBinder(List<FieldInterfaced> fields) {
        super(new PropertySet() {

            private Map<String, PropertyDefinition> definitions = createDefinitions(this, fields);

            @Override
            public Stream<PropertyDefinition> getProperties() {
                return definitions.values().stream();
            }

            @Override
            public Optional<PropertyDefinition> getProperty(String s) {
                return Optional.of(definitions.get(s));
            }
        });
        this.beanType = new HashMap<String, Object>().getClass();
    }


    public static Map<String,PropertyDefinition> createDefinitions(PropertySet propertySet, List<FieldInterfaced> fields) {
        Map<String,PropertyDefinition> defs = new HashMap<>();

        fields.forEach(f -> defs.put(f.getName(), new PropertyDefinition() {
            private ValueProvider valueProvider = new ValueProvider() {
                @Override
                public Object apply(Object o) {
                    try {
                        return ReflectionHelper.getValue(f, o);
                    } catch (Exception e) {
                        MDD.alert(e);
                        return null;
                    }
                }
            };

            @Override
            public ValueProvider getGetter() {
                return valueProvider;
            }

            @Override
            public Optional<Setter> getSetter() {
                return Optional.of(new Setter() {
                    @Override
                    public void accept(Object o, Object v) {
                        try {
                            ReflectionHelper.setValue(f, o, v);
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    }
                });
            }

            @Override
            public Class getType() {
                if (int.class.equals(f.getType())) return Integer.class;
                if (long.class.equals(f.getType())) return Long.class;
                if (float.class.equals(f.getType())) return Float.class;
                if (double.class.equals(f.getType())) return Double.class;
                if (boolean.class.equals(f.getType())) return Boolean.class;
                else return f.getType();
            }

            @Override
            public Class<?> getPropertyHolderType() {
                return f.getDeclaringClass();
            }

            @Override
            public String getName() {
                return f.getName();
            }

            @Override
            public String getCaption() {
                return ReflectionHelper.getCaption(f);
            }

            @Override
            public PropertySet getPropertySet() {
                return propertySet;
            }
        }));

        return defs;
    }

    public MDDBinder(Class beanType) {
        super(beanType);
        this.beanType = beanType;
    }


    public MDDBinder(Class beanType, EditorViewComponent component) {
        super(beanType);
        this.beanType = beanType;
        this.viewComponent = component;
    }

    public AbstractViewComponent getViewComponent() {
        return viewComponent;
    }

    public void setViewComponent(AbstractViewComponent viewComponent) {
        this.viewComponent = viewComponent;
    }

    public List<Object> getMergeables() {
        return mergeables;
    }

    public List<Object> getRemovables() {
        return removables;
    }

    @Override
    public void setBean(Object bean) {
        setBean(bean, true);
    }

    public void setBean(Object bean, boolean reset) {
        super.setBean(bean);

        if (reset) {
            mergeables.clear();
            removables.clear();
        }
    }

    public Class getBeanType() {
        return beanType;
    }

    public void refresh() {
        setBean(getBean(), false);
    }
}
