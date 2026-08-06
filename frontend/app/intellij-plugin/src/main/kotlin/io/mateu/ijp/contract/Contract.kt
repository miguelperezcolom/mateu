package io.mateu.ijp.contract

/** A ModelView's bindable field (mirrors io.mateu.dtos.ModelViewContractDto.Field). */
data class ContractField(
  val id: String,
  val dataType: String?,
  val stereotype: String?,
  val required: Boolean,
  val readOnly: Boolean,
)

/**
 * The bindable surface of a ModelView, as the backend reports it (mirrors
 * io.mateu.dtos.ModelViewContractDto). Unlike raw PSI — which sees every field and method — this
 * lists only what actually BINDS at runtime (a `@Hidden`/excluded field is absent; a plain method
 * that is not an `@Action` is absent), and it carries Mateu's own dataType/stereotype for each field.
 */
data class ModelViewContract(
  val modelView: String?,
  val fields: List<ContractField>,
  val actions: List<String>,
) {
  fun field(id: String): ContractField? = fields.firstOrNull { it.id == id }

  fun hasAction(id: String): Boolean = actions.contains(id)
}
