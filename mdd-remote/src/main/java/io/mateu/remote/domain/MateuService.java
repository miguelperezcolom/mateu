package io.mateu.remote.domain;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.dtos.ActionData;
import io.mateu.remote.dtos.UI;
import io.mateu.remote.dtos.View;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
public class MateuService {
    public Optional<UI> getUi(String uiClassName) {
        try {
            Class uiClass = Class.forName(uiClassName);
            Object uiInstance = ReflectionHelper.newInstance(uiClass);

            if (uiInstance == null) {
                throw new Exception();
            }

            UI ui = new UIMapper().map(uiInstance);
            return Optional.of(ui);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error on getUi", e);
            throw new NotFoundException("No class with name " + uiClassName + " found");
        }
    }

    public Optional<View> getView(String viewClassName) {
        try {
            Class uiClass = Class.forName(viewClassName);
            Object uiInstance = ReflectionHelper.newInstance(uiClass);

            if (uiInstance == null) {
                throw new Exception();
            }

            View ui = new ViewMapper().map(uiInstance);
            return Optional.of(ui);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error on getUi", e);
            throw new NotFoundException("No class with name " + viewClassName + " found");
        }
    }

    public View runAction(String viewClassName, String actionId, ActionData data) {
        try {
            Class uiClass = Class.forName(viewClassName);
            Object uiInstance = ReflectionHelper.newInstance(uiClass);

            if (uiInstance == null) {
                throw new Exception();
            }

            fill(uiInstance, data.getData());

            Method method = ReflectionHelper.getMethod(uiClass, actionId);
            Object result = method.invoke(uiInstance, getArgs(method, data.getArgs()));

            View ui = new ViewMapper().map(result);
            return ui;
        } catch (Exception e) {
            e.printStackTrace();
            log.error("error on getUi", e);
            throw new NotFoundException("No class with name " + viewClassName + " found");
        }
    }

    private Object[] getArgs(Method method, Map<String, Object> values) {
        List<Object> args = new ArrayList<>();
        for (Parameter parameter : method.getParameters()) {
            args.add(values.get(parameter.getName()));
        }
        return args.toArray();
    }

    private void fill(Object uiInstance, Map<String, Object> data) {
        data.keySet().forEach(k -> {
            try {
                ReflectionHelper.setValue(k, uiInstance, data.get(k));
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            }
        });
    }
}
