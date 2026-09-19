package io.mateu.ijp.contract

import com.intellij.codeInsight.intention.IntentionAction
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.project.Project
import com.intellij.psi.JavaPsiFacade
import com.intellij.psi.PsiClass
import com.intellij.psi.PsiFile
import com.intellij.psi.search.GlobalSearchScope

/**
 * "Create action '<id>' in <ViewModel>" — the IDE-only half of the Layout ↔ ViewModel sync (visual-editor
 * Phase 5, §G). Offered by [MateuYamlBindingAnnotator] on an `actionId:` the bound ModelView has no method
 * for: it writes a `public void <id>() {}` method that the id then resolves to (a plain public method is
 * invocable by actionId; add `@Action`/`@Toolbar` yourself to make it a button or give it options).
 */
class CreateActionInViewModelFix(
  private val fqn: String,
  private val actionId: String,
) : IntentionAction {

  override fun getText(): String = "Create action '$actionId' in ${fqn.substringAfterLast('.').substringAfterLast('$')}"

  override fun getFamilyName(): String = "Create Mateu action in ViewModel"

  override fun startInWriteAction(): Boolean = true

  override fun isAvailable(project: Project, editor: Editor?, file: PsiFile?): Boolean {
    if (!CreateFieldInViewModelFix.isValidIdentifier(actionId)) return false
    val cls = resolve(project) ?: return false
    return cls.findMethodsByName(actionId, false).isEmpty()
  }

  override fun invoke(project: Project, editor: Editor?, file: PsiFile?) {
    val cls = resolve(project) ?: return
    val factory = JavaPsiFacade.getElementFactory(project)
    val method = factory.createMethodFromText("public void $actionId() {\n}", cls)
    cls.add(method)
  }

  private fun resolve(project: Project): PsiClass? {
    val facade = JavaPsiFacade.getInstance(project)
    val scope = GlobalSearchScope.allScope(project)
    return facade.findClass(fqn, scope) ?: facade.findClass(fqn.replace('$', '.'), scope)
  }
}
