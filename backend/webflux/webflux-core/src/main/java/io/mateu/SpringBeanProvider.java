package io.mateu;

import io.mateu.core.domain.BeanProvider;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
public class SpringBeanProvider implements BeanProvider {

    private final ApplicationContext applicationContext;

    public SpringBeanProvider(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public <T> T getBean(Class<T> clazz) {
        return applicationContext.getBean(clazz);
    }
}
