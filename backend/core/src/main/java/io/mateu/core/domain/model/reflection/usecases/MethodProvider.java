package io.mateu.core.domain.model.reflection.usecases;

import org.springframework.stereotype.Service;

import java.lang.reflect.Method;

@Service
public class MethodProvider {

    private final AllMethodsProvider allMethodsProvider;

    public MethodProvider(AllMethodsProvider allMethodsProvider) {
        this.allMethodsProvider = allMethodsProvider;
    }

    //todo: cache
    public Method getMethod(Class<?> c, String methodName) {
        Method m = null;
        if (c != null)
            for (Method q : allMethodsProvider.getAllMethods(c)) {
                if (methodName.equals(q.getName())) {
                    m = q;
                    break;
                }
            }
        return m;
    }

}
