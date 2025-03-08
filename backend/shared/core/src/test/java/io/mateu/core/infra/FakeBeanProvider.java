package io.mateu.core.infra;

import io.mateu.core.domain.BeanProvider;
import jakarta.inject.Named;

@Named
public class FakeBeanProvider implements BeanProvider {
    @Override
    public <T> T getBean(Class<T> clazz) {
        return null;
    }
}
