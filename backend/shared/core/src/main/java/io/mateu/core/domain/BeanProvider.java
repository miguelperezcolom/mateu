package io.mateu.core.domain;

public interface BeanProvider {

  <T> T getBean(Class<T> clazz);
}
