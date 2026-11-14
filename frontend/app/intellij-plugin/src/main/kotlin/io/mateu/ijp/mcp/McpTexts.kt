package io.mateu.ijp.mcp

import io.mateu.ijp.ui.ChromeLanguage
import java.util.Locale

/**
 * The words of the desktop MCP server's settings and its "an agent is operating" notice, in the six
 * languages of the plugin's chrome ([ChromeLanguage]). Pure (unit-tested for completeness).
 */
object McpTexts {

    data class Texts(
        val group: String,
        val enable: String,
        val enableHelp: String,
        val port: String,
        val address: String,
        val token: String,
        val copy: String,
        val copied: String,
        val regenerate: String,
        val regenerated: String,
        val claudeCode: String,
        val anyClient: String,
        val portBusy: String,
        /** "An AI agent is operating {product}" — `%s` is the product name. */
        val operating: String,
        val stop: String,
        val stopped: String,
    )

    private val TABLE: Map<String, Texts> = mapOf(
        "en" to Texts(
            group = "AI agents (MCP)",
            enable = "Let AI agents operate this app (MCP)",
            enableHelp = "Off by default. An agent on this computer that has the token can read the screen you are on and use it as you: " +
                "navigate, fill in fields and press buttons. Everything goes through your own session, so the server's permissions apply. " +
                "Only reachable from this computer (127.0.0.1).",
            port = "Port:",
            address = "Address:",
            token = "Token:",
            copy = "Copy",
            copied = "Copied to the clipboard",
            regenerate = "Regenerate token",
            regenerated = "A new token was generated: agents using the old one are disconnected.",
            claudeCode = "Claude Code:",
            anyClient = "Any MCP client (JSON):",
            portBusy = "The port was busy: the server listens on %d instead.",
            operating = "An AI agent is operating %s",
            stop = "Stop",
            stopped = "AI agents can no longer operate this app. Turn it on again in Settings › Tools › Mateu.",
        ),
        "es" to Texts(
            group = "Agentes de IA (MCP)",
            enable = "Permitir que agentes de IA manejen esta aplicación (MCP)",
            enableHelp = "Desactivado por defecto. Un agente de este ordenador que tenga el token puede leer la pantalla en la que estás y usarla como tú: " +
                "navegar, rellenar campos y pulsar botones. Todo pasa por tu propia sesión, así que se aplican los permisos del servidor. " +
                "Solo es accesible desde este ordenador (127.0.0.1).",
            port = "Puerto:",
            address = "Dirección:",
            token = "Token:",
            copy = "Copiar",
            copied = "Copiado al portapapeles",
            regenerate = "Regenerar token",
            regenerated = "Se generó un token nuevo: los agentes que usaban el anterior quedan desconectados.",
            claudeCode = "Claude Code:",
            anyClient = "Cualquier cliente MCP (JSON):",
            portBusy = "El puerto estaba ocupado: el servidor escucha en el %d.",
            operating = "Un agente de IA está manejando %s",
            stop = "Detener",
            stopped = "Los agentes de IA ya no pueden manejar esta aplicación. Vuelve a activarlo en Ajustes › Herramientas › Mateu.",
        ),
        "fr" to Texts(
            group = "Agents d'IA (MCP)",
            enable = "Autoriser des agents d'IA à piloter cette application (MCP)",
            enableHelp = "Désactivé par défaut. Un agent de cet ordinateur qui possède le jeton peut lire l'écran sur lequel vous êtes et l'utiliser comme vous : " +
                "naviguer, remplir des champs et appuyer sur des boutons. Tout passe par votre propre session : les droits du serveur s'appliquent. " +
                "Accessible uniquement depuis cet ordinateur (127.0.0.1).",
            port = "Port :",
            address = "Adresse :",
            token = "Jeton :",
            copy = "Copier",
            copied = "Copié dans le presse-papiers",
            regenerate = "Régénérer le jeton",
            regenerated = "Un nouveau jeton a été généré : les agents qui utilisaient l'ancien sont déconnectés.",
            claudeCode = "Claude Code :",
            anyClient = "Tout client MCP (JSON) :",
            portBusy = "Le port était occupé : le serveur écoute sur le %d.",
            operating = "Un agent d'IA pilote %s",
            stop = "Arrêter",
            stopped = "Les agents d'IA ne peuvent plus piloter cette application. Réactivez-le dans Paramètres › Outils › Mateu.",
        ),
        "de" to Texts(
            group = "KI-Agenten (MCP)",
            enable = "KI-Agenten erlauben, diese App zu bedienen (MCP)",
            enableHelp = "Standardmäßig aus. Ein Agent auf diesem Computer, der das Token hat, kann den Bildschirm lesen, auf dem Sie sind, und ihn wie Sie bedienen: " +
                "navigieren, Felder ausfüllen und Schaltflächen drücken. Alles läuft über Ihre eigene Sitzung, daher gelten die Berechtigungen des Servers. " +
                "Nur von diesem Computer aus erreichbar (127.0.0.1).",
            port = "Port:",
            address = "Adresse:",
            token = "Token:",
            copy = "Kopieren",
            copied = "In die Zwischenablage kopiert",
            regenerate = "Token neu erzeugen",
            regenerated = "Ein neues Token wurde erzeugt: Agenten mit dem alten Token sind getrennt.",
            claudeCode = "Claude Code:",
            anyClient = "Jeder MCP-Client (JSON):",
            portBusy = "Der Port war belegt: Der Server lauscht stattdessen auf %d.",
            operating = "Ein KI-Agent bedient %s",
            stop = "Stoppen",
            stopped = "KI-Agenten können diese App nicht mehr bedienen. Aktivieren Sie es wieder unter Einstellungen › Tools › Mateu.",
        ),
        "pt" to Texts(
            group = "Agentes de IA (MCP)",
            enable = "Permitir que agentes de IA operem esta aplicação (MCP)",
            enableHelp = "Desativado por padrão. Um agente deste computador que tenha o token pode ler a tela em que você está e usá-la como você: " +
                "navegar, preencher campos e pressionar botões. Tudo passa pela sua própria sessão, por isso valem as permissões do servidor. " +
                "Acessível apenas a partir deste computador (127.0.0.1).",
            port = "Porta:",
            address = "Endereço:",
            token = "Token:",
            copy = "Copiar",
            copied = "Copiado para a área de transferência",
            regenerate = "Gerar novo token",
            regenerated = "Foi gerado um novo token: os agentes que usavam o anterior foram desconectados.",
            claudeCode = "Claude Code:",
            anyClient = "Qualquer cliente MCP (JSON):",
            portBusy = "A porta estava ocupada: o servidor escuta na %d.",
            operating = "Um agente de IA está operando %s",
            stop = "Parar",
            stopped = "Os agentes de IA já não podem operar esta aplicação. Volte a ativá-lo em Configurações › Ferramentas › Mateu.",
        ),
        "it" to Texts(
            group = "Agenti IA (MCP)",
            enable = "Consenti agli agenti IA di usare questa applicazione (MCP)",
            enableHelp = "Disattivato per impostazione predefinita. Un agente di questo computer che ha il token può leggere la schermata in cui ti trovi e usarla come te: " +
                "navigare, compilare campi e premere pulsanti. Tutto passa per la tua sessione, quindi valgono i permessi del server. " +
                "Raggiungibile solo da questo computer (127.0.0.1).",
            port = "Porta:",
            address = "Indirizzo:",
            token = "Token:",
            copy = "Copia",
            copied = "Copiato negli appunti",
            regenerate = "Rigenera token",
            regenerated = "È stato generato un nuovo token: gli agenti che usavano il precedente sono disconnessi.",
            claudeCode = "Claude Code:",
            anyClient = "Qualsiasi client MCP (JSON):",
            portBusy = "La porta era occupata: il server ascolta sulla %d.",
            operating = "Un agente IA sta usando %s",
            stop = "Ferma",
            stopped = "Gli agenti IA non possono più usare questa applicazione. Riattivalo in Impostazioni › Strumenti › Mateu.",
        ),
    )

    fun of(locale: Locale?): Texts = ChromeLanguage.pick(locale, TABLE)

    /** Every language's texts (completeness test). */
    internal val all: Map<String, Texts> get() = TABLE
}
