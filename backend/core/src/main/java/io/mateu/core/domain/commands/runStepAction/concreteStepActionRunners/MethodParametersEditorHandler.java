package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.reflection.usecases.AllMethodsProvider;
import io.mateu.core.domain.model.reflection.usecases.InstanceProvider;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MethodParametersEditorHandler {

    private final InstanceProvider instanceProvider;
    private final AllMethodsProvider allMethodsProvider;

    public MethodParametersEditorHandler(InstanceProvider instanceProvider, AllMethodsProvider allMethodsProvider) {
        this.instanceProvider = instanceProvider;
        this.allMethodsProvider = allMethodsProvider;
    }

    public boolean handles(MethodParametersEditor methodParametersEditor, String actionId) {
        return "run".equals(actionId);
    }

    @SneakyThrows
    public Object getTargetInstance(MethodParametersEditor methodParametersEditor) {
        return instanceProvider.newInstance(methodParametersEditor.getType(), methodParametersEditor.getData());
    }
}
