package ${project.packageName}.infra.in.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
<#list project.modules as module>
    <#list module.aggregates as aggregate>
        import ${project.packageName}.infra.in.ui.pages.${aggregate.name?lower_case}.${aggregate.name}CrudOrchestrator;
    </#list>
</#list>

@UI("")
@Title("My App")
public class Home {



<#list project.modules as module>
    <#list module.aggregates as aggregate>
        @Menu
        ${aggregate.name}CrudOrchestrator ${aggregate.name?lower_case}s;
    </#list>
</#list>

}
