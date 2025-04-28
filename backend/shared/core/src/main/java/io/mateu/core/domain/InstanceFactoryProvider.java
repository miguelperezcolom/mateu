package io.mateu.core.domain;

public interface InstanceFactoryProvider {

    InstanceFactory get(String className);

}
