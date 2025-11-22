package io.mateu.uidl.di;

import java.util.Collection;

public class MateuBeanProvider {

    private static BeanProvider beanProvider;

    public static void setBeanProvider(BeanProvider beanProvider) {
        MateuBeanProvider.beanProvider = beanProvider;
    }

    public static <T> T getBean(Class<T> clazz) {
        return beanProvider.getBean(clazz);
    }

    public static <T> Collection<T> getBeans(Class<T> clazz) {
        return beanProvider.getBeans(clazz);
    }

}
