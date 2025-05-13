import Component from "@mateu/shared/apiClients/dtos/Component";
import SingleComponent from "@mateu/shared/apiClients/dtos/SingleComponent";

export default interface UIFragment {

    root: SingleComponent
    components: Record<string, Component>

}
