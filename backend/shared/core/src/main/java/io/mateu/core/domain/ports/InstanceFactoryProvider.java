package io.mateu.core.domain.ports;

public interface InstanceFactoryProvider {

  InstanceFactory get(String className);
}
