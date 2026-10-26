package io.mateu.ijp.live

import com.intellij.execution.ExecutionException
import com.intellij.execution.Executor
import com.intellij.execution.configurations.CommandLineState
import com.intellij.execution.configurations.ConfigurationFactory
import com.intellij.execution.configurations.ConfigurationTypeBase
import com.intellij.execution.configurations.GeneralCommandLine
import com.intellij.execution.configurations.RunConfiguration
import com.intellij.execution.configurations.RunConfigurationBase
import com.intellij.execution.configurations.RunConfigurationOptions
import com.intellij.execution.configurations.RunProfile
import com.intellij.execution.configurations.RunProfileState
import com.intellij.execution.configurations.RunnerSettings
import com.intellij.execution.configurations.RuntimeConfigurationError
import com.intellij.execution.executors.DefaultDebugExecutor
import com.intellij.execution.process.KillableColoredProcessHandler
import com.intellij.execution.process.ProcessHandler
import com.intellij.execution.process.ProcessTerminatedListener
import com.intellij.execution.runners.ExecutionEnvironment
import com.intellij.execution.runners.GenericProgramRunner
import com.intellij.execution.runners.RunContentBuilder
import com.intellij.execution.ui.RunContentDescriptor
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.options.SettingsEditor
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.ComboBox
import com.intellij.openapi.util.IconLoader
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import com.intellij.util.ui.FormBuilder
import java.io.File
import javax.swing.JComponent

/**
 * The **Mateu App** run configuration: this project's Mateu UI started in development mode (live
 * reload) and opened where [LaunchTarget] says — the browser, this IDE's Mateu tool window, the
 * Mateu app on an Android emulator / iOS simulator, or a phone through a QR code. Run starts it;
 * Debug also attaches the debugger to the app's JVM (HotSwap re-renders the open screen).
 */
class MateuAppConfigurationType : ConfigurationTypeBase(
    ID,
    "Mateu App",
    "Run a Mateu UI in development mode and open it on the web, the desktop or the Mateu app",
    IconLoader.getIcon("/icons/mateu.svg", MateuAppConfigurationType::class.java),
) {
    init {
        addFactory(MateuAppConfigurationFactory(this))
    }

    companion object {
        const val ID = "MateuAppRunConfiguration"
    }
}

class MateuAppConfigurationFactory(type: MateuAppConfigurationType) : ConfigurationFactory(type) {
    override fun getId(): String = MateuAppConfigurationType.ID

    override fun createTemplateConfiguration(project: Project): RunConfiguration =
        MateuAppRunConfiguration(project, this, "Mateu App")

    override fun getOptionsClass(): Class<MateuAppRunConfigurationOptions> = MateuAppRunConfigurationOptions::class.java
}

class MateuAppRunConfigurationOptions : RunConfigurationOptions() {
    private val targetOption = string(LaunchTarget.WEB.name).provideDelegate(this, "target")
    private val moduleDirOption = string("").provideDelegate(this, "moduleDir")

    var target: String?
        get() = targetOption.getValue(this)
        set(value) = targetOption.setValue(this, value)

    var moduleDir: String?
        get() = moduleDirOption.getValue(this)
        set(value) = moduleDirOption.setValue(this, value)
}

class MateuAppRunConfiguration(project: Project, factory: ConfigurationFactory, name: String) :
    RunConfigurationBase<MateuAppRunConfigurationOptions>(project, factory, name) {

    override fun getOptions(): MateuAppRunConfigurationOptions = super.getOptions() as MateuAppRunConfigurationOptions

    var target: LaunchTarget
        get() = runCatching { LaunchTarget.valueOf(options.target ?: "") }.getOrDefault(LaunchTarget.WEB)
        set(value) { options.target = value.name }

    /** The module to run; blank = found from the project (a runnable app first, else a static bundle). */
    var moduleDir: String
        get() = options.moduleDir.orEmpty()
        set(value) { options.moduleDir = value }

    /** The launch plan for this configuration, or null when the project has nothing to run. */
    fun plan(): LiveRunPlan? {
        val root = project.basePath?.let(::File) ?: return null
        val module = moduleDir.takeIf { it.isNotBlank() }?.let(::File) ?: appModuleOf(root)
        return liveRunPlanOf(module, root, lan = target.needsLan)
    }

    override fun getConfigurationEditor(): SettingsEditor<out RunConfiguration> = MateuAppSettingsEditor()

    override fun checkConfiguration() {
        val plan = plan() ?: throw RuntimeConfigurationError("No pom.xml or build.gradle found: nothing to run.")
        if (plan.framework == Framework.UNKNOWN) {
            throw RuntimeConfigurationError(
                "The build declares no Spring Boot, Quarkus, Micronaut or Helidon app, nor a static bundle.",
            )
        }
        target.unsupportedReason(plan.framework)?.let { throw RuntimeConfigurationError(it) }
    }

    override fun getState(executor: Executor, environment: ExecutionEnvironment): RunProfileState? {
        val plan = plan() ?: throw ExecutionException("No pom.xml or build.gradle found under ${project.basePath}: nothing to run.")
        target.unsupportedReason(plan.framework)?.let { throw ExecutionException(it) }
        return MateuAppState(environment, plan, target, debug = executor.id == DefaultDebugExecutor.EXECUTOR_ID)
    }
}

/** Starts the plan's command; once the app answers, [MateuLiveService] opens it on the target. */
class MateuAppState(
    environment: ExecutionEnvironment,
    private val plan: LiveRunPlan,
    private val target: LaunchTarget,
    private val debug: Boolean,
) : CommandLineState(environment) {

    override fun startProcess(): ProcessHandler {
        val commandLine = GeneralCommandLine(plan.command)
            .withWorkDirectory(plan.workDir)
            .withEnvironment(plan.environment)
            .withParentEnvironmentType(GeneralCommandLine.ParentEnvironmentType.CONSOLE)
        val handler = KillableColoredProcessHandler(commandLine)
        ProcessTerminatedListener.attach(handler)
        MateuLiveService.getInstance(environment.project).launched(handler, plan, target, debug)
        return handler
    }
}

/**
 * Debug for a Mateu App: runs it like Run does, and [MateuLiveService] attaches the JVM debugger once
 * the app answers (the app is started with the debug agent either way).
 */
class MateuAppDebugRunner : GenericProgramRunner<RunnerSettings>() {
    override fun getRunnerId(): String = "MateuAppDebugRunner"

    override fun canRun(executorId: String, profile: RunProfile): Boolean =
        executorId == DefaultDebugExecutor.EXECUTOR_ID && profile is MateuAppRunConfiguration

    override fun doExecute(state: RunProfileState, environment: ExecutionEnvironment): RunContentDescriptor? {
        FileDocumentManager.getInstance().saveAllDocuments()
        val result = state.execute(environment.executor, this) ?: return null
        return RunContentBuilder(result, environment).showRunContent(environment.contentToReuse)
    }
}

class MateuAppSettingsEditor : SettingsEditor<MateuAppRunConfiguration>() {
    private val targetCombo = ComboBox(LaunchTarget.entries.toTypedArray())
    private val moduleField = JBTextField().apply {
        emptyText.text = "Found from the project: a runnable app first, else a static bundle"
    }
    private val hint = JBLabel(
        "<html>The Mateu app on a simulator or a phone accepts a plain <code>http</code> address only in a " +
            "development build.</html>",
    ).apply { componentStyle = com.intellij.util.ui.UIUtil.ComponentStyle.SMALL }

    override fun resetEditorFrom(configuration: MateuAppRunConfiguration) {
        targetCombo.selectedItem = configuration.target
        moduleField.text = configuration.moduleDir
    }

    override fun applyEditorTo(configuration: MateuAppRunConfiguration) {
        configuration.target = targetCombo.selectedItem as? LaunchTarget ?: LaunchTarget.WEB
        configuration.moduleDir = moduleField.text.trim()
    }

    override fun createEditor(): JComponent = FormBuilder.createFormBuilder()
        .addLabeledComponent("Open in:", targetCombo)
        .addComponentToRightColumn(hint)
        .addLabeledComponent("Module directory:", moduleField)
        .panel
}
