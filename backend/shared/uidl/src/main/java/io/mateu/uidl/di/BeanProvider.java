package io.mateu.uidl.di;

import java.util.Collection;

public interface BeanProvider {

  <T> T getBean(Class<T> clazz);

  <T> Collection<T> getBeans(Class<T> clazz);
}
