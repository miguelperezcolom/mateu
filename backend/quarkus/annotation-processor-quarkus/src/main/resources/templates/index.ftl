package ${pkgName};

import io.mateu.core.infra.IndexPage;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.ConfigProvider;

@Path("<#if path?has_content>${path}<#else>/</#if>")
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

    private static boolean debug() {
        return ConfigProvider.getConfig().getOptionalValue("mateu.debug", Boolean.class).orElse(false);
    }

    // Any route under the UI, however deep (/hotel/stays/FO-1 on a reload or a shared link), answers
    // the index; a segment with a dot is a static asset (dist/assets/mateu.js) and is left alone.
    @Path("/{path: [^.]+}")
    @GET
    @Produces(MediaType.TEXT_HTML)
    public String getIndexAlways() {
        return getIndex();
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    public String getIndex() {
        return IndexPage.render(getClass(), "${indexHtmlPath}", SPEC.withDebug(debug()));
    }

}
