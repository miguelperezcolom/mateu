package io.mateu.compose.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.atStartOfDayIn
import kotlinx.datetime.toLocalDateTime

/**
 * Compose port of the JavaFX `FormFieldRenderer`. Picks an input widget by `dataType` /
 * `stereotype`, seeds it from `state[fieldId]` (or `metadata.initialValue`), and writes user
 * edits back into `app.currentComponentState[fieldId]` — exactly like the JavaFX renderer.
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

        Text(fullLabel, style = androidx.compose.material3.MaterialTheme.typography.labelMedium)

        val options = metadata.arr("options")
        when {
            stereotype == "textarea" ->
                PlainTextField(fieldId, value, enabled, app, singleLine = false, isError = hasError)

            options.isNotEmpty() ->
                OptionsField(fieldId, options, value, enabled, app, isError = hasError)

            dataType == "reference" ->
                ReferenceField(fieldId, data, enabled, app, isError = hasError)

            stereotype == "password" ->
                PlainTextField(fieldId, value, enabled, app, password = true, isError = hasError)

            dataType in DATE_TYPES ->
                DateField(fieldId, value, enabled, app, isError = hasError)

            dataType in INT_TYPES ->
                NumberField(fieldId, value, enabled, app, integer = true, isError = hasError)

            dataType in NUMBER_TYPES || stereotype in MONEY_STEREOTYPES ->
                NumberField(fieldId, value, enabled, app, integer = false, isError = hasError)

            else ->
                PlainTextField(fieldId, value, enabled, app, isError = hasError)
        }

        if (error != null) {
            Text(
                error,
                color = androidx.compose.material3.MaterialTheme.colorScheme.error,
                style = androidx.compose.material3.MaterialTheme.typography.labelSmall,
            )
        }
    }
}

private val BOOL_TYPES = setOf("bool", "boolean", "Boolean")
private val DATE_TYPES = setOf("date", "LocalDate")
private val INT_TYPES = setOf("integer", "int", "long", "Integer", "Long")
private val NUMBER_TYPES = setOf("number", "double", "float", "decimal", "BigDecimal")
private val MONEY_STEREOTYPES = setOf("money", "currency")

@Composable
private fun BooleanField(fieldId: String, label: String, initial: Boolean, enabled: Boolean, app: AppState) {
    var checked by remember(fieldId) { mutableStateOf(initial) }
    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
        Checkbox(
            checked = checked,
            enabled = enabled,
            onCheckedChange = { checked = it; app.currentComponentState[fieldId] = it },
        )
        Text(label)
    }
}

@Composable
private fun PlainTextField(
    fieldId: String,
    initial: String,
    enabled: Boolean,
    app: AppState,
    singleLine: Boolean = true,
    password: Boolean = false,
    isError: Boolean = false,
) {
    var text by remember(fieldId) { mutableStateOf(initial) }
    OutlinedTextField(
        value = text,
        onValueChange = { text = it; app.currentComponentState[fieldId] = it },
        enabled = enabled,
        isError = isError,
        singleLine = singleLine,
        minLines = if (singleLine) 1 else 4,
        visualTransformation = if (password) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun NumberField(fieldId: String, initial: String, enabled: Boolean, app: AppState, integer: Boolean, isError: Boolean = false) {
    var text by remember(fieldId) { mutableStateOf(initial) }
    OutlinedTextField(
        value = text,
        isError = isError,
        onValueChange = { raw ->
            // Reject non-numeric input outright so letters can't be typed into a numeric field.
            val filtered = if (integer) {
                raw.filterIndexed { i, c -> c.isDigit() || (c == '-' && i == 0) }
            } else {
                raw.filterIndexed { i, c -> c.isDigit() || (c == '-' && i == 0) || c == '.' || c == ',' }
            }
            text = filtered
            if (integer) filtered.toIntOrNull()?.let { app.currentComponentState[fieldId] = it }
            else filtered.replace(',', '.').toDoubleOrNull()?.let { app.currentComponentState[fieldId] = it }
        },
        enabled = enabled,
        singleLine = true,
        keyboardOptions = KeyboardOptions(
            keyboardType = if (integer) KeyboardType.Number else KeyboardType.Decimal,
        ),
        modifier = Modifier.fillMaxWidth(),
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DateField(fieldId: String, initial: String, enabled: Boolean, app: AppState, isError: Boolean = false) {
    var text by remember(fieldId) { mutableStateOf(initial) }
    var show by remember { mutableStateOf(false) }

    OutlinedTextField(
        value = text,
        onValueChange = {},
        readOnly = true,
        enabled = enabled,
        isError = isError,
        placeholder = { Text("YYYY-MM-DD") },
        trailingIcon = {
            if (enabled) IconButton(onClick = { show = true }) { Text("📅") } // 📅
        },
        modifier = Modifier.fillMaxWidth(),
    )

    if (show) {
        val pickerState = rememberDatePickerState(initialSelectedDateMillis = parseDateToMillis(text))
        DatePickerDialog(
            onDismissRequest = { show = false },
            confirmButton = {
                TextButton(onClick = {
                    pickerState.selectedDateMillis?.let { millis ->
                        val iso = millisToIsoDate(millis)
                        text = iso
                        app.currentComponentState[fieldId] = iso
                    }
                    show = false
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { show = false }) { Text("Cancel") } },
        ) {
            DatePicker(state = pickerState)
        }
    }
}

private fun parseDateToMillis(s: String): Long? =
    runCatching { LocalDate.parse(s).atStartOfDayIn(TimeZone.UTC).toEpochMilliseconds() }.getOrNull()

private fun millisToIsoDate(millis: Long): String =
    Instant.fromEpochMilliseconds(millis).toLocalDateTime(TimeZone.UTC).date.toString()

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun OptionsField(fieldId: String, options: List<JsonNode>, value: String, enabled: Boolean, app: AppState, isError: Boolean = false) {
    val labels = options.map { it.text("label", it.text("value")) }
    val initialLabel = options.firstOrNull { it.text("value") == value }
        ?.let { it.text("label", it.text("value")) } ?: value
    var expanded by remember { mutableStateOf(false) }
    var selectedLabel by remember(fieldId) { mutableStateOf(initialLabel) }

    ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { if (enabled) expanded = it }) {
        OutlinedTextField(
            value = selectedLabel,
            onValueChange = {},
            readOnly = true,
            enabled = enabled,
            isError = isError,
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
            modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable, true),
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEachIndexed { i, opt ->
                DropdownMenuItem(
                    text = { Text(labels[i]) },
                    onClick = {
                        selectedLabel = labels[i]
                        app.currentComponentState[fieldId] = opt.text("value")
                        expanded = false
                    },
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ReferenceField(fieldId: String, data: JsonNode, enabled: Boolean, app: AppState, isError: Boolean = false) {
    val remote = if (!data.isNull && !data.isMissingNode) {
        if (data.has(fieldId)) data.path(fieldId) else data
    } else EMPTY
    val content = if (remote.has("content")) remote.path("content") else remote
    val options = if (content.isArray) content.toList() else emptyList()
    val labels = options.map { it.text("label", it.text("name", it.text("value"))) }

    var expanded by remember { mutableStateOf(false) }
    var selectedLabel by remember(fieldId) { mutableStateOf("") }

    ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { if (enabled) expanded = it }) {
        OutlinedTextField(
            value = selectedLabel,
            onValueChange = {},
            readOnly = true,
            enabled = enabled,
            isError = isError,
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
            modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable, true),
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEachIndexed { i, _ ->
                DropdownMenuItem(
                    text = { Text(labels[i]) },
                    onClick = {
                        selectedLabel = labels[i]
                        app.currentComponentState[fieldId] = labels[i]
                        expanded = false
                    },
                )
            }
        }
    }
}

/** Standalone client-side Button component (metadata-based). */
@Composable
fun MateuClientButton(metadata: JsonNode, app: AppState) {
    val id = metadata.text("id")
    val label = metadata.text("label", id)
    val actionId = metadata.text("actionId", id)
    androidx.compose.material3.OutlinedButton(
        onClick = { app.runAction(actionId, null) },
        enabled = !metadata.bool("disabled"),
    ) { Text(label) }
}
