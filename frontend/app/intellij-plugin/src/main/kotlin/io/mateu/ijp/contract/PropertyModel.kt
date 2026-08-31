package io.mateu.ijp.contract

import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile
import com.intellij.psi.util.PsiTreeUtil
import org.jetbrains.yaml.psi.YAMLFile
import org.jetbrains.yaml.psi.YAMLMapping
import org.jetbrains.yaml.psi.YAMLScalar

/**
 * Reads the component under the caret and its editable scalar properties, for the property panel.
 * The component is the nearest enclosing YAML mapping that has a `type:` key; each of its other
 * scalar key-values is an editable property, carrying the source range of its VALUE so the panel
 * can write an edit straight back into the document.
 */
object PropertyModel {

  /** An editable property: its key, its current raw value text, and that value's source range. */
  data class Prop(val key: String, val value: String, val valueStart: Int, val valueEnd: Int)

  data class ComponentProps(val type: String, val props: List<Prop>)

  fun at(file: PsiFile, offset: Int): ComponentProps? {
    if (file !is YAMLFile || file.textLength == 0) return null
    val element: PsiElement? = file.findElementAt(offset.coerceIn(0, file.textLength - 1))
    var mapping = PsiTreeUtil.getParentOfType(element, YAMLMapping::class.java)
    // walk up to the nearest mapping that names a component (has a `type:`)
    while (mapping != null && mapping.getKeyValueByKey("type") == null) {
      mapping = PsiTreeUtil.getParentOfType(mapping, YAMLMapping::class.java)
    }
    if (mapping == null) return null
    val type = mapping.getKeyValueByKey("type")?.valueText ?: return null
    val props = mapping.keyValues.mapNotNull { kv ->
      val value = kv.value
      // scalar props only (skip `type` and nested content/children lists/maps)
      if (kv.keyText == "type" || value !is YAMLScalar) null
      else Prop(kv.keyText, value.text, value.textRange.startOffset, value.textRange.endOffset)
    }
    return ComponentProps(type, props)
  }
}
