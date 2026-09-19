package io.mateu.ijp.contract

import com.intellij.codeInsight.intention.IntentionAction
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.project.Project
import com.intellij.psi.JavaPsiFacade
import com.intellij.psi.PsiClass
import com.intellij.psi.PsiFile
import com.intellij.psi.codeStyle.JavaCodeStyleManager
import com.intellij.psi.search.GlobalSearchScope

/**
 * "Create field '<id>' in <ViewModel>" — the IDE-only half of the Layout ↔ ViewModel sync (visual-editor
 * Phase 5, §G). Offered by [MateuYamlBindingAnnotator] on a `FormField` `id:` that the bound ModelView
 * does not declare: instead of only flagging the dangling binding, it writes the field into the class.
 *
 * The field type follows the sibling `dataType:` when present (string→String, number→Double, …), else
 * String. Records are excluded (they have no addable instance field) — offered only for a plain class.
 */
class CreateFieldInViewModelFix(
  private val fqn: String,
  private val fieldId: String,
  private val dataType: String?,
) : IntentionAction {

  override fun getText(): String = "Create field '$fieldId' in ${fqn.substringAfterLast('.').substringAfterLast('$')}"

  override fun getFamilyName(): String = "Create Mateu field in ViewModel"

  override fun startInWriteAction(): Boolean = true

  override fun isAvailable(project: Project, editor: Editor?, file: PsiFile?): Boolean {
    if (!isValidIdentifier(fieldId)) return false
    val cls = resolve(project) ?: return false
    return !cls.isRecord && cls.findFieldByName(fieldId, false) == null
  }

  override fun invoke(project: Project, editor: Editor?, file: PsiFile?) {
    val cls = resolve(project) ?: return
    val factory = JavaPsiFacade.getElementFactory(project)
    val field = factory.createFieldFromText("private ${javaType(dataType)} $fieldId;", cls)
    val added = cls.add(field)
    JavaCodeStyleManager.getInstance(project).shortenClassReferences(added)
  }

  private fun resolve(project: Project): PsiClass? {
    val facade = JavaPsiFacade.getInstance(project)
    val scope = GlobalSearchScope.allScope(project)
    return facade.findClass(fqn, scope) ?: facade.findClass(fqn.replace('$', '.'), scope)
  }

  companion object {
    /** The Java type for a Mateu wire dataType. Unknown/absent → String (the safe, common default). */
    fun javaType(dataType: String?): String = when (dataType) {
      "integer" -> "Integer"
      "number", "decimal" -> "Double"
      "bool", "boolean" -> "Boolean"
      "date" -> "java.time.LocalDate"
      "dateTime" -> "java.time.LocalDateTime"
      "time" -> "java.time.LocalTime"
      "money" -> "java.math.BigDecimal"
      else -> "String"
    }

    fun isValidIdentifier(s: String): Boolean =
      s.isNotEmpty() && Character.isJavaIdentifierStart(s[0]) && s.all { Character.isJavaIdentifierPart(it) }
  }
}
