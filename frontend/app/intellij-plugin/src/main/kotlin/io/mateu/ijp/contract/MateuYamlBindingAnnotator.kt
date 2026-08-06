package io.mateu.ijp.contract

import com.intellij.lang.annotation.AnnotationHolder
import com.intellij.lang.annotation.Annotator
import com.intellij.lang.annotation.HighlightSeverity
import com.intellij.openapi.project.DumbService
import com.intellij.openapi.project.Project
import com.intellij.psi.JavaPsiFacade
import com.intellij.psi.PsiClass
import com.intellij.psi.PsiElement
import com.intellij.psi.search.GlobalSearchScope
import org.jetbrains.yaml.psi.YAMLFile
import org.jetbrains.yaml.psi.YAMLKeyValue
import org.jetbrains.yaml.psi.YAMLMapping

/**
 * Validates the binding of a Mateu visual-builder page (phase 2): a page YAML that declares a
 * `modelView:` must only reference fields and actions that actually exist on that class. It flags,
 * live as you type:
 *
 *  - a `modelView:` that does not resolve to a class,
 *  - a `FormField` `id:` that is not a property of the ModelView,
 *  - an `actionId:` that is not a method of the ModelView.
 *
 * Purely from the IDE's PSI — no running server, no build — so it works offline. This is membership
 * validation (does it exist?); the richer type/stereotype rules live in the backend's
 * `ModelViewContractExtractor` and can be layered on later.
 */
class MateuYamlBindingAnnotator : Annotator {

  override fun annotate(element: PsiElement, holder: AnnotationHolder) {
    if (element !is YAMLKeyValue) return
    val key = element.keyText
    if (key != "modelView" && key != "actionId" && key != "id") return

    val project = element.project
    if (DumbService.isDumb(project)) return // class resolution is unavailable while indexing

    val page = pageMapping(element) ?: return
    val fqn = page.getKeyValueByKey("modelView")?.valueText?.trim().orEmpty()
    if (fqn.isEmpty()) return

    val value = element.value ?: return
    val id = element.valueText?.trim().orEmpty()

    when (key) {
      "modelView" -> {
        if (element.parent !== page) return // only the page-level declaration
        if (resolveClass(project, fqn) == null) {
          error(holder, value, "Cannot resolve ModelView class '$fqn'")
        }
      }

      "actionId" -> {
        if (id.isEmpty()) return
        val cls = resolveClass(project, fqn) ?: return // the modelView error is reported on its own
        if (!hasAction(cls, id)) {
          error(holder, value, "'$id' is not an action on ${cls.name} — no method named '$id'")
          return
        }
        // The method exists — but is it a Mateu action? The backend contract knows (a plain method
        // that is not an @Action won't dispatch). Only available once the contract has been fetched.
        val contract = ContractCache.getInstance(project).get(fqn) ?: return
        if (!contract.hasAction(id)) {
          warn(holder, value, "'$id' exists on ${cls.name} but is not a Mateu action (missing @Action?)")
        }
      }

      "id" -> {
        if (id.isEmpty()) return
        val mapping = element.parent as? YAMLMapping ?: return
        // only a FormField's id binds to a ModelView property
        if (mapping.getKeyValueByKey("type")?.valueText?.trim() != "FormField") return
        val cls = resolveClass(project, fqn) ?: return
        if (!hasProperty(cls, id)) {
          error(holder, value, "'$id' is not a field on ${cls.name}")
          return
        }
        // The property exists — refine against the backend contract (it lists only what actually
        // binds, and carries the field's real dataType).
        val contract = ContractCache.getInstance(project).get(fqn) ?: return
        val field = contract.field(id)
        if (field == null) {
          warn(holder, value, "'$id' exists on ${cls.name} but is not a bindable field (hidden or excluded?)")
          return
        }
        // An annotator may only mark the element it is given, so flag the id value itself (the
        // message names the conflicting dataType declared on the sibling).
        val declaredType = mapping.getKeyValueByKey("dataType")?.valueText?.trim()
        if (declaredType != null && field.dataType != null && declaredType != field.dataType) {
          warn(holder, value, "'$id' maps to dataType '${field.dataType}', not the declared '$declaredType'")
        }
      }
    }
  }

  /** The page envelope (top-level mapping) iff this file is a Mateu bound page: has modelView + layout. */
  private fun pageMapping(element: PsiElement): YAMLMapping? {
    val file = element.containingFile as? YAMLFile ?: return null
    val top = file.documents.firstOrNull()?.topLevelValue as? YAMLMapping ?: return null
    if (top.getKeyValueByKey("modelView") == null || top.getKeyValueByKey("layout") == null) {
      return null
    }
    return top
  }

  private fun resolveClass(project: Project, fqn: String): PsiClass? {
    val facade = JavaPsiFacade.getInstance(project)
    val scope = GlobalSearchScope.allScope(project)
    // nested classes are written Outer$Inner on the wire but Outer.Inner in Java source
    return facade.findClass(fqn, scope) ?: facade.findClass(fqn.replace('$', '.'), scope)
  }

  private fun hasAction(cls: PsiClass, name: String): Boolean =
    cls.findMethodsByName(name, true).isNotEmpty()

  private fun hasProperty(cls: PsiClass, name: String): Boolean {
    if (cls.findFieldByName(name, true) != null) return true
    if (cls.recordComponents.any { it.name == name }) return true
    val cap = name.replaceFirstChar { it.uppercaseChar() }
    return cls.findMethodsByName("get$cap", true).isNotEmpty() ||
      cls.findMethodsByName("is$cap", true).isNotEmpty()
  }

  private fun error(holder: AnnotationHolder, range: PsiElement, message: String) {
    holder.newAnnotation(HighlightSeverity.ERROR, message).range(range).create()
  }

  private fun warn(holder: AnnotationHolder, range: PsiElement, message: String) {
    holder.newAnnotation(HighlightSeverity.WEAK_WARNING, message).range(range).create()
  }
}
