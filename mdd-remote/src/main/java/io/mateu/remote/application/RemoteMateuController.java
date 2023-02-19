package io.mateu.remote.application;

import io.mateu.mdd.core.app.MateuApp;
import io.mateu.remote.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("mateu/v1")
public class RemoteMateuController {

    @Autowired
    MateuService mateuService;

    @GetMapping(value = "uis/{uiClassName}")
    public UI getUI(@PathVariable String uiClassName) throws ClassNotFoundException, InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException {
        Optional<UI> ui = mateuService.getUi(uiClassName);

        if (!ui.isPresent()) {
            throw new NotFoundException("No class with name " + uiClassName + " found");
        }

        return ui.get();
    }

    @GetMapping("views/{viewClassName}")
    public View getView(@PathVariable String viewClassName) throws ClassNotFoundException, InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException {
        Optional<View> view = mateuService.getView(viewClassName);

        if (!view.isPresent()) {
            throw new NotFoundException("No class with name " + viewClassName + " found");
        }

        return view.get();
    }

    @PostMapping("views/{viewClassName}/{actionId}")
    public View runAction(@PathVariable String viewClassName,
                          @PathVariable String actionId,
                          @RequestBody ActionData actionData
                          ) {
        Optional<View> view = mateuService.getView(viewClassName);

        if (!view.isPresent()) {
            throw new NotFoundException("No class with name " + viewClassName + " found");
        }

        return mateuService.runAction(viewClassName, actionId, actionData);
    }

}
