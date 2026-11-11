package ${pkgName};

import io.mateu.core.infra.IndexPage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("${pkgName}.${simpleClassName}Controller")
@RequestMapping("<#if path?has_content>${path}<#else>/</#if>")
public class ${simpleClassName}Controller {

<#assign extraHead><#list metas as m><meta<#if m.name?has_content> name="${m.name}"</#if><#if m.httpEquiv?has_content> http-equiv="${m.httpEquiv}"</#if><#if m.charset?has_content> charset="${m.charset}"</#if> content="${m.content}"></#list><#list links as l><link rel="${l.rel}" href="${l.href}"<#if l.type?has_content> type="${l.type}"</#if><#if l.as?has_content> as="${l.as}"</#if><#if l.crossorigin> crossorigin</#if>></#list><#list scripts as s><script<#if s.type?has_content> type="${s.type}"</#if> src="${s.src}"<#if s.crossorigin> crossorigin</#if><#if s.defer> defer</#if><#if s.async> async</#if>></script></#list></#assign>
    // The page itself is built by io.mateu.core.infra.IndexPage — ONE implementation for every
    // adapter (title, favicon, @Meta/@Link/@Script, the deferred-boot replayer that
    // starts a Visual Builder (redwood) page, and its fallback when the Oracle runtime cannot load).
    private static final IndexPage.Spec SPEC = new IndexPage.Spec(
            "${path?j_string}",
            "${pageTitle?j_string}",
            "${favicon?j_string}",
            java.util.List.of(<#list externalScripts as x>"${x?j_string}"<#sep>, </#sep></#list>),
            "${extraHead?j_string}",
            false,
            "${className?j_string}");

    @Value("${r"${mateu.debug:false}"}")
    private boolean debug;

    // Deep links (/orders/42 on a reload or a shared link) are forwarded here by SpaRedirectFilter.
    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(jakarta.servlet.http.HttpServletRequest request) {
        // under a context path / a trusted X-Forwarded-Prefix the page names its assets and API there
        return IndexPage.underPrefix(
                IndexPage.render(getClass(), "${indexHtmlPath}", SPEC.withDebug(debug)),
                io.mateu.MateuRequestPaths.prefixOf(request));
    }

}
