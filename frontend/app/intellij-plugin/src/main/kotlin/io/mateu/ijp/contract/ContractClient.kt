package io.mateu.ijp.contract

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.MateuApiClient
import io.mateu.ijp.plugin.loadMateuConfig

/**
 * Fetches a ModelView's bindable contract from the running Mateu backend, over the same sync
 * transport the renderer uses: a POST with the ModelView as `serverSideType` and the reserved
 * `__contract__` action; the contract rides back on `appData._contract`. Blocking — always call it
 * off the UI thread (see [ContractCache]).
 */
object ContractClient {

  private const val CONTRACT_ACTION = "__contract__"
  private const val CONTRACT_KEY = "_contract"

  fun fetch(fqn: String): ModelViewContract? {
    val config = loadMateuConfig()
    val client = MateuApiClient(config.baseUrl, "mateu-plugin-contract")
    val response =
      client.runAction(
        route = "",
        consumedRoute = "",
        actionId = CONTRACT_ACTION,
        serverSideType = fqn,
        initiatorComponentId = "ux_main",
        componentState = emptyMap(),
        appState = emptyMap(),
        parameters = emptyMap(),
      )
    val node = response.path("appData").path(CONTRACT_KEY)
    if (node.isMissingNode || node.isNull) return null
    val modelView = node.path("modelView").takeIf { it.isTextual }?.asText() ?: return null
    if (modelView != fqn) return null // sanity: we got the class we asked for
    return ModelViewContract(modelView, parseFields(node.path("fields")), parseActions(node.path("actions")))
  }

  private fun parseFields(fields: JsonNode): List<ContractField> =
    fields.mapNotNull { f ->
      val id = f.path("id").takeIf { it.isTextual }?.asText().orEmpty()
      if (id.isEmpty()) null
      else ContractField(
        id = id,
        dataType = f.path("dataType").takeIf { it.isTextual }?.asText(),
        stereotype = f.path("stereotype").takeIf { it.isTextual }?.asText(),
        required = f.path("required").asBoolean(false),
        readOnly = f.path("readOnly").asBoolean(false),
      )
    }

  private fun parseActions(actions: JsonNode): List<String> =
    actions.mapNotNull { a -> a.path("id").takeIf { it.isTextual }?.asText() }.filter { it.isNotEmpty() }
}
