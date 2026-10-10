package io.mateu.ijp.newproject

import com.intellij.ide.util.projectWizard.WizardContext
import com.intellij.ide.wizard.AbstractNewProjectWizardStep
import com.intellij.ide.wizard.GeneratorNewProjectWizard
import com.intellij.ide.wizard.GitNewProjectWizardStep
import com.intellij.ide.wizard.NewProjectWizardBaseData.Companion.baseData
import com.intellij.ide.wizard.NewProjectWizardBaseStep
import com.intellij.ide.wizard.NewProjectWizardChainStep.Companion.nextStep
import com.intellij.ide.wizard.NewProjectWizardStep
import com.intellij.ide.wizard.RootNewProjectWizardStep
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.progress.ProgressManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.IconLoader
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.ui.CollectionComboBoxModel
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.dsl.builder.AlignX
import com.intellij.ui.dsl.builder.Panel
import com.intellij.ui.dsl.builder.COLUMNS_MEDIUM
import com.intellij.ui.dsl.builder.bindText
import com.intellij.ui.dsl.builder.columns
import io.mateu.ijp.newfile.MateuNewFiles
import io.mateu.ijp.newproject.MateuProjectGenerator.Choice
import java.io.File
import javax.swing.Icon

/**
 * File | New | Project… › Mateu: the IntelliJ front door of the shared project generator
 * ([MateuProjectGenerator], the same data the VS Code `Mateu: New Project` command applies). The
 * platform's own steps give the name, location and Git; this step adds the Mateu choices — authoring
 * flavour, runtime, renderer, sample, YAML page templates and Maven coordinates — and writes the
 * project into the new project's folder. A Maven project is then offered for import by the IDE.
 */
class MateuNewProjectWizard : GeneratorNewProjectWizard {
    override val id: String = "mateu"
    override val name: String = "Mateu"
    override val icon: Icon = IconLoader.getIcon("/icons/mateu.svg", MateuNewProjectWizard::class.java)
    override val description: String =
        "A Mateu app: the UI declared once — as code or as YAML — rendered without frontend code."

    override fun createStep(context: WizardContext): NewProjectWizardStep =
        RootNewProjectWizardStep(context)
            .nextStep(::NewProjectWizardBaseStep)
            .nextStep(::GitNewProjectWizardStep)
            .nextStep(::MateuStep)
}

private class MateuStep(parent: NewProjectWizardStep) : AbstractNewProjectWizardStep(parent) {

    private val sources = MateuProjectGenerator.Bundled
    private val manifest = MateuProjectGenerator.manifest(sources)
    private val authorings = MateuProjectGenerator.authoring(manifest)
    private val allRuntimes = MateuProjectGenerator.runtimes(manifest)
    private val allRenderers = MateuProjectGenerator.renderers(manifest)
    private val allSamples = MateuProjectGenerator.samples(manifest)
    private val pageTemplates = MateuNewFiles.catalogue.pageTemplates

    private val authoringModel = CollectionComboBoxModel(authorings, authorings.first())
    private val runtimeModel = CollectionComboBoxModel<Choice>()
    private val rendererModel = CollectionComboBoxModel<Choice>()
    private val sampleModel = CollectionComboBoxModel<Choice>()

    private val hasRuntime = propertyGraph.property(true)
    private val hasRenderer = propertyGraph.property(true)
    private val hasSample = propertyGraph.property(true)
    private val hasPages = propertyGraph.property(false)
    private val isJava = propertyGraph.property(true)
    private val groupId = propertyGraph.property("com.example")
    private val packageName = propertyGraph.property("")
    private val pageBoxes = pageTemplates.associate { it.id to JBCheckBox(it.label).apply { toolTipText = it.description } }
    private var packageEdited = false

    private fun authoringId() = (authoringModel.selected ?: authorings.first()).id
    private fun runtimeId() = runtimeModel.selected?.id?.takeIf { hasRuntime.get() }
    private fun rendererId() = rendererModel.selected?.id?.takeIf { hasRenderer.get() }
    private fun artifactId() = baseData?.name?.trim().orEmpty()

    private var refreshing = false

    /** Re-fills the dependent choices after the flavour, the runtime or the renderer changed. */
    private fun refresh() {
        if (refreshing) return // refilling a model fires the combos' listeners again
        refreshing = true
        try {
            doRefresh()
        } finally {
            refreshing = false
        }
    }

    private fun doRefresh() {
        val a = manifest.path("authoring").first { it.path("id").asText() == authoringId() }
        val runtimes = a.path("runtimes").map { it.asText() }
        hasRuntime.set(runtimes.isNotEmpty())
        refill(runtimeModel, allRuntimes.filter { it.id in runtimes })
        val r = MateuProjectGenerator.resolve(manifest, authoringId(), runtimeId()).getOrNull() ?: return
        hasRenderer.set(r.renderers.size > 1)
        refill(rendererModel, allRenderers.filter { it.id in r.renderers })
        val renderer = rendererModel.selected?.id ?: r.renderers.firstOrNull()
        val samples = r.samples.filter { MateuProjectGenerator.incompatibility(manifest, authoringId(), runtimeId(), renderer, it) == null }
        hasSample.set(samples.size > 1)
        refill(sampleModel, allSamples.filter { it.id in samples })
        hasPages.set(a.path("pages").asBoolean(false))
        isJava.set(r.language == "java")
    }

    private fun refill(model: CollectionComboBoxModel<Choice>, items: List<Choice>) {
        val keep = model.selected?.id
        model.replaceAll(items)
        model.selectedItem = items.firstOrNull { it.id == keep } ?: items.firstOrNull()
    }

    override fun setupUI(builder: Panel) {
        refresh()
        with(builder) {
            row("Authoring:") {
                comboBox(authoringModel).align(AlignX.FILL).applyToComponent { addActionListener { refresh() } }
            }
            row("") {
                comment("Code: @UI classes. YAML only: the UI is data under specs/ui — served by Spring Boot, or bundled into static files with no backend. Code + YAML: both, side by side.")
            }
            row("Runtime:") {
                comboBox(runtimeModel).applyToComponent { addActionListener { refresh() } }
            }.visibleIf(hasRuntime)
            row("Renderer:") {
                comboBox(rendererModel).applyToComponent { addActionListener { refresh() } }
            }.visibleIf(hasRenderer)
            row("Start from:") {
                comboBox(sampleModel)
            }.visibleIf(hasSample)
            group("Sample Pages (Page Templates)") {
                for (chunk in pageTemplates.chunked(3)) {
                    row { chunk.forEach { cell(pageBoxes.getValue(it.id)) } }
                }
            }.visibleIf(hasPages)
            row("Group id:") {
                textField().bindText(groupId).columns(COLUMNS_MEDIUM).validationOnApply {
                    if (isJava.get() && !MateuProjectGenerator.JAVA_NAME_PATTERN.matches(it.text.trim())) error("A dotted Java name, e.g. com.acme") else null
                }
            }.visibleIf(isJava)
            row("Package:") {
                textField().bindText(packageName).columns(COLUMNS_MEDIUM).validationOnApply {
                    if (isJava.get() && !MateuProjectGenerator.JAVA_NAME_PATTERN.matches(it.text.trim())) error("A dotted Java name, e.g. com.acme.shop") else null
                }
            }.visibleIf(isJava)
            row("") {
                comment("The project name is the artifact id. The Mateu version is the latest release on Maven Central. AGENTS.md and CLAUDE.md tell AI assistants how the project works.")
            }
        }
        baseData?.nameProperty?.afterChange { syncPackage() }
        groupId.afterChange { syncPackage() }
        packageName.afterChange { if (!syncing) packageEdited = true }
        syncPackage()
    }

    private var syncing = false

    /** Keeps the package derived from group id + name until the user edits it. */
    private fun syncPackage() {
        if (packageEdited) return
        syncing = true
        try {
            packageName.set(MateuProjectGenerator.defaultPackage(groupId.get(), artifactId().ifEmpty { "app" }))
        } finally {
            syncing = false
        }
    }

    override fun setupProject(project: Project) {
        val target = File(baseData?.path ?: return, artifactId())
        val r = MateuProjectGenerator.resolve(manifest, authoringId(), runtimeId()).getOrNull() ?: return
        val fallback = MateuProjectGenerator.pinnedVersion(sources, r.starter)
        val version = ProgressManager.getInstance().runProcessWithProgressSynchronously<String, RuntimeException>(
            { MateuProjectGenerator.latestMateuVersion(manifest, fallback) }, "Resolving the latest Mateu release…", true, project,
        ) ?: fallback
        val options = MateuProjectGenerator.Options(
            authoring = authoringId(),
            runtime = runtimeId(),
            buildTool = if (isJava.get()) "maven" else null,
            renderer = rendererModel.selected?.id?.takeIf { r.renderers.isNotEmpty() },
            sample = sampleModel.selected?.id ?: r.samples.first(),
            pages = if (hasPages.get()) pageTemplates.filter { pageBoxes.getValue(it.id).isSelected }.map { it.id } else emptyList(),
            groupId = if (isJava.get()) groupId.get().trim() else "",
            artifactId = artifactId(),
            packageName = if (isJava.get()) packageName.get().trim() else "",
            version = version,
        )
        val notifications = NotificationGroupManager.getInstance().getNotificationGroup("Mateu")
        val errors = MateuProjectGenerator.validate(manifest, options)
        if (errors.isNotEmpty()) {
            notifications.createNotification("Mateu project not generated", errors.joinToString("<br>"), NotificationType.ERROR).notify(project)
            return
        }
        // The IDE may already have created .idea/ in the folder: write our files next to it.
        MateuProjectGenerator.write(MateuProjectGenerator.generate(sources, options), target, requireEmpty = false)
        LocalFileSystem.getInstance().refreshAndFindFileByIoFile(target)?.refresh(false, true)
        notifications.createNotification(
            "Mateu project created",
            "Mateu $version. Run: ${MateuProjectGenerator.runCommand(manifest, options)}",
            NotificationType.INFORMATION,
        ).notify(project)
    }
}
