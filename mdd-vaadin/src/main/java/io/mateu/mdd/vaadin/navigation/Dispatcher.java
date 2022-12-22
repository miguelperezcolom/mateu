package io.mateu.mdd.vaadin.navigation;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.firstLevel.HomeController;
import io.mateu.mdd.vaadin.controllers.secondLevel.EditorController;
import io.mateu.mdd.vaadin.controllers.secondLevel.WizardController;

public class Dispatcher {

    private final MateuViewProvider mateuViewProvider;
    private final String path;
    private final App app;
    private final ViewStack stack;
    private final boolean privada;

    public Dispatcher(MateuViewProvider mateuViewProvider, String path, boolean privada) {
        this.mateuViewProvider = mateuViewProvider;
        this.path = path;
        this.app = mateuViewProvider.getApp();
        this.stack = mateuViewProvider.getStack();
        this.privada = privada;
    }

    /**
     * the main method. It will add to the stack all the necessary views until completing the path in the stack
     */
    public void dispatch() {

        mateuViewProvider.setCurrentEditor(null);
        Controller controller = null;


        //bajar a la última parte del path que exista en el stack
        io.mateu.mdd.vaadin.navigation.View view = null;
        String foundPath = path;
        String remainingPath = "";
        while (!Strings.isNullOrEmpty(foundPath) && view == null) {
            if (stack.get(foundPath) != null) {
                view = (io.mateu.mdd.vaadin.navigation.View) stack.popTo(foundPath);
                if (mateuViewProvider.getFirstViewInWindow() > stack.size() + 1)mateuViewProvider.setFirstViewInWindow(0);
            }
            if (view == null && !Strings.isNullOrEmpty(foundPath) && foundPath.contains("/")) {
                remainingPath = foundPath.substring(foundPath.lastIndexOf("/")) + remainingPath;
                foundPath = foundPath.substring(0, foundPath.lastIndexOf("/"));
            }
        }


        // si no tenemos nada, entonces vaciar el stack (hay que reconstruirlo)
        if (Strings.isNullOrEmpty(foundPath) || view == null) {
            stack.clear();
        }


        // obtener el controller
        if ( view != null) {
            controller = view.getController();
            view = null;
        } else {
            controller = createBaseController();
        }

        // aplicamos el path pendiente al controlador (dejará vistas en el stack)
        new ControllerPathApplier(controller, stack, foundPath, remainingPath).apply();
    }

    /**
     * returns the first controller to be placed in the stack, in position 0
     *
     * @return the first controller to be placed in the stack
     */
    private Controller createBaseController() {
        return WizardPage.class.isAssignableFrom(app.getBean().getClass())?
                new WizardController(stack, "", (WizardPage) app.getBean()):
                app.isForm()?
                        new EditorController(stack, "", app.getBean()):
                        new HomeController(stack, privada);
    }
}
