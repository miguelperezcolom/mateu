package io.mateu.mdd.core.data;

import com.vaadin.data.Binder;

import java.util.ArrayList;
import java.util.List;

public class MDDBinder extends Binder {

    private List<Object> mergeables = new ArrayList<>();

    public MDDBinder(Class beanType) {
        super(beanType);
    }

    public List<Object> getMergeables() {
        return mergeables;
    }

    @Override
    public void setBean(Object bean) {
        setBean(bean, true);
    }

    public void setBean(Object bean, boolean reset) {
        super.setBean(bean);

        if (reset) mergeables.clear();
    }

}
