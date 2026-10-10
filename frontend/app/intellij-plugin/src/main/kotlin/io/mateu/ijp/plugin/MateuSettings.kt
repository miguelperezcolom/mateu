package io.mateu.ijp.plugin

import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.Storage
import com.intellij.openapi.project.Project
import com.intellij.util.xmlb.XmlSerializerUtil

/**
 * Per-project Mateu settings (Settings | Tools | Mateu), stored in `.idea/mateu.xml`. Secrets are NOT
 * kept here: the bearer token and the OIDC refresh token live in the IDE's credential store
 * (PasswordSafe, see [io.mateu.ijp.auth.MateuCredentials]). `-D` system properties still win, so a
 * CI/dev run can override a project without editing it.
 */
@Service(Service.Level.PROJECT)
// Qualified: the nested `State` bean shadows the annotation's simple name.
@com.intellij.openapi.components.State(name = "MateuSettings", storages = [Storage("mateu.xml")])
class MateuSettings : PersistentStateComponent<MateuSettings.State> {

    /** Serialized bean: public mutable properties with defaults (XmlSerializer convention). */
    class State {
        var baseUrl: String = ""
        var route: String = ""
        var registryUrl: String = ""
        var appId: String = ""
        var authMode: AuthMode = AuthMode.NONE
        var oidcIssuer: String = ""
        var oidcClientId: String = ""
        var oidcScope: String = "openid profile offline_access"
        var oidcDeviceEndpoint: String = ""
        var oidcTokenEndpoint: String = ""
    }

    enum class AuthMode(val label: String) {
        NONE("No authentication"),
        TOKEN("Bearer token"),
        OIDC("OpenID Connect (device sign-in)"),
        ;

        override fun toString(): String = label
    }

    private var current = State()

    override fun getState(): State = current

    override fun loadState(state: State) {
        current = State().also { XmlSerializerUtil.copyBean(state, it) }
    }

    companion object {
        fun getInstance(project: Project): MateuSettings = project.getService(MateuSettings::class.java)
    }
}

