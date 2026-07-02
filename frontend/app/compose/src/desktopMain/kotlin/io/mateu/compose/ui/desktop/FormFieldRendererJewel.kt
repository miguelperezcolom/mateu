package io.mateu.compose.ui.desktop

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState
import io.mateu.compose.ui.*
import org.jetbrains.jewel.ui.Outline
import org.jetbrains.jewel.ui.component.CheckboxRow
import org.jetbrains.jewel.ui.component.Dropdown
import org.jetbrains.jewel.ui.component.OutlinedButton
import org.jetbrains.jewel.ui.component.Text
import org.jetbrains.jewel.ui.component.TextArea
import org.jetbrains.jewel.ui.component.TextField

/**
 * Jewel port of the shared `FormFieldRenderer`. Picks an input widget by `dataType` / `stereotype`,
 * seeds it from `state[fieldId]` (or `metadata.initialValue`), and writes user edits back into
 * `app.currentComponentState[fieldId]`.
 */
@Composable
fun FormFieldRenderer(metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val fieldId = metadata.text("fieldId")
    val label = metadata.text("label", fieldId)
    val dataType = metadata.text("dataType", "string")
    val stereotype = metadata.text("stereotype")
    val required = metadata.bool("required")
    val readOnly = metadata.bool("readOnly")
    val disabled = metadata.bool("disabled")
    val enabled = !readOnly && !disabled

    val rawValue: JsonNode = if (!state.isNull && !state.isMissingNode && state.has(fieldId)) {
        state.path(fieldId)
    } else {
        metadata.path("initialValue")
    }
    val value = if (rawValue.isNull || rawValue.isMissingNode) "" else rawValue.asText("")

    val fullLabel = label + if (required) " *" else ""

    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        // Boolean → inline checkbox with label, no separate caption
        if (dataType in BOOL_TYPES) {
            BooleanField(fieldId, label, rawValue.asBoolean(false), enabled, app)
            return@Column
        }

        if (required) app.registerRequiredField(fieldId, label, value)
        val error = app.fieldErrors[fieldId]
        val hasError = error != null

        Text(fullLabel, style = JewelStyle.label())

        val options = metadata.arr("options")
        when {
            stereotype == "textarea" ->
                PlainTextArea(fieldId, value, enabled, app, isError = hasError)

            options.isNotEmpty() ->
                OptionsField(fieldId, options, value, enabled, app)

            dataType == "reference" ->
                ReferenceField(fieldId, data, enabled, app)

            stereotype == "password" ->
                PlainTextField(fieldId, value, enabled, app, isError = hasError)

            dataType in DATE_TYPES ->
                PlainTextField(fieldId, value, enabled, app, isError = hasError, placeholder = "YYYY-MM-DD")

            dataType in INT_TYPES ->
                NumberField(fieldId, value, enabled, app, integer = true, isError = hasError)

            dataType in NUMBER_TYPES || stereotype in MONEY_STEREOTYPES ->
                NumberField(fieldId, value, enabled, app, integer = false, isError = hasError)

            else ->
                PlainTextField(fieldId, value, enabled, app, isError = hasError)
        }

        if (error != null) {
            Text(error, color = JewelStyle.error, style = JewelStyle.label())
        }
    }
}

private val BOOL_TYPES = setOf("bool", "boolean", "Boolean")
private val DATE_TYPES = setOf("date", "LocalDate")
private val INT_TYPES = setOf("integer", "int", "long", "Integer", "Long")
private val NUMBER_TYPES = setOf("number", "double", "float", "decimal", "BigDecimal")
private val MONEY_STEREOTYPES = setOf("money", "currency")

private fun outlineFor(isError: Boolean) = if (isError) Outline.Error else Outline.None

@Composable
private fun BooleanField(fieldId: String, label: String, initial: Boolean, enabled: Boolean, app: AppState) {
    var checked by remember(fieldId) { mutableStateOf(initial) }
    CheckboxRow(
        text = label,
        checked = checked,
        onCheckedChange = { checked = it; app.currentComponentState[fieldId] = it },
        enabled = enabled,
    )
}

@Composable
private fun PlainTextField(
    fieldId: String,
    initial: String,
    enabled: Boolean,
    app: AppState,
    isError: Boolean = false,
    placeholder: String? = null,
) {
    val state = rememberTextFieldState(initial)
    LaunchedEffect(state) {
        snapshotFlow { state.text.toString() }.collect { app.currentComponentState[fieldId] = it }
    }
    TextField(
        state = state,
        enabled = enabled,
        outline = outlineFor(isError),
        placeholder = if (placeholder != null) ({ Text(placeholder) }) else null,
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun PlainTextArea(fieldId: String, initial: String, enabled: Boolean, app: AppState, isError: Boolean = false) {
    val state = rememberTextFieldState(initial)
    LaunchedEffect(state) {
        snapshotFlow { state.text.toString() }.collect { app.currentComponentState[fieldId] = it }
    }
    TextArea(
        state = state,
        enabled = enabled,
        outline = outlineFor(isError),
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun NumberField(fieldId: String, initial: String, enabled: Boolean, app: AppState, integer: Boolean, isError: Boolean = false) {
    val state = rememberTextFieldState(initial)
    LaunchedEffect(state) {
        snapshotFlow { state.text.toString() }.collect { raw ->
            if (integer) raw.toIntOrNull()?.let { app.currentComponentState[fieldId] = it }
            else raw.replace(',', '.').toDoubleOrNull()?.let { app.currentComponentState[fieldId] = it }
        }
    }
    TextField(
        state = state,
        enabled = enabled,
        outline = outlineFor(isError),
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun OptionsField(fieldId: String, options: List<JsonNode>, value: String, enabled: Boolean, app: AppState) {
    val labels = options.map { it.text("label", it.text("value")) }
    val initialLabel = options.firstOrNull { it.text("value") == value }
        ?.let { it.text("label", it.text("value")) } ?: value
    var selectedLabel by remember(fieldId) { mutableStateOf(initialLabel) }

    Dropdown(
        enabled = enabled,
        modifier = Modifier.fillMaxWidth(),
        menuContent = {
            options.forEachIndexed { i, opt ->
                selectableItem(selected = selectedLabel == labels[i], onClick = {
                    selectedLabel = labels[i]
                    app.currentComponentState[fieldId] = opt.text("value")
                }) { Text(labels[i]) }
            }
        },
    ) { Text(selectedLabel) }
}

@Composable
private fun ReferenceField(fieldId: String, data: JsonNode, enabled: Boolean, app: AppState) {
    val remote = if (!data.isNull && !data.isMissingNode) {
        if (data.has(fieldId)) data.path(fieldId) else data
    } else EMPTY
    val content = if (remote.has("content")) remote.path("content") else remote
    val options = if (content.isArray) content.toList() else emptyList()
    val labels = options.map { it.text("label", it.text("name", it.text("value"))) }

    var selectedLabel by remember(fieldId) { mutableStateOf("") }

    Dropdown(
        enabled = enabled,
        modifier = Modifier.fillMaxWidth(),
        menuContent = {
            options.forEachIndexed { i, _ ->
                selectableItem(selected = selectedLabel == labels[i], onClick = {
                    selectedLabel = labels[i]
                    app.currentComponentState[fieldId] = labels[i]
                }) { Text(labels[i]) }
            }
        },
    ) { Text(selectedLabel.ifBlank { "—" }) }
}

/** Standalone client-side Button component (metadata-based). */
@Composable
fun MateuClientButton(metadata: JsonNode, app: AppState) {
    val id = metadata.text("id")
    val label = metadata.text("label", id)
    val actionId = metadata.text("actionId", id)
    OutlinedButton(
        onClick = { app.runAction(actionId, null) },
        enabled = !metadata.bool("disabled"),
    ) { Text(label) }
}
