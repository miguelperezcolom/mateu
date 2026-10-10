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
    // adapter (title, favicon, @Meta/@Link/@Script, Keycloak SSO, the deferred-boot replayer that
    // starts a Visual Builder (redwood) page, and its fallback when the Oracle runtime cannot load).
    private static final IndexPage.Spec SPEC = new IndexPage.Spec(
            "${path?j_string}",
            "${pageTitle?j_string}",
            "${favicon?j_string}",
            java.util.List.of(<#list externalScripts as x>"${x?j_string}"<#sep>, </#sep></#list>),
            <#if keycloak??>new IndexPage.Keycloak("${keycloak.url?j_string}", "${keycloak.realm?j_string}", "${keycloak.clientId?j_string}", "${keycloak.jsUrl?j_string}")<#else>null</#if>,
            "${extraHead?j_string}",
            false);

    @Value("${r"${mateu.debug:false}"}")
    private boolean debug;

    // Any route under the UI (up to 8 segments without a dot) answers the index — the SPA fallback.
    @GetMapping(value = {"{s1}", "{s1:[^.]+}/{s2:[^.]+}", "{s1:[^.]+}/{s2:[^.]+}/{s3:[^.]+}", "{s1:[^.]+}/{s2:[^.]+}/{s3:[^.]+}/{s4:[^.]+}", "{s1:[^.]+}/{s2:[^.]+}/{s3:[^.]+}/{s4:[^.]+}/{s5:[^.]+}", "{s1:[^.]+}/{s2:[^.]+}/{s3:[^.]+}/{s4:[^.]+}/{s5:[^.]+}/{s6:[^.]+}", "{s1:[^.]+}/{s2:[^.]+}/{s3:[^.]+}/{s4:[^.]+}/{s5:[^.]+}/{s6:[^.]+}/{s7:[^.]+}", "{s1:[^.]+}/{s2:[^.]+}/{s3:[^.]+}/{s4:[^.]+}/{s5:[^.]+}/{s6:[^.]+}/{s7:[^.]+}/{s8:[^.]+}"}, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndexAlways() {
        return getIndex();
    }

    @GetMapping(value = "", produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        return IndexPage.render(getClass(), "${indexHtmlPath}", SPEC.withDebug(debug));
    }

}
