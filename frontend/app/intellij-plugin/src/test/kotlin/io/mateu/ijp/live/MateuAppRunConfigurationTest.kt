package io.mateu.ijp.live

import com.intellij.execution.RunManager
import com.intellij.execution.configurations.RuntimeConfigurationError
import com.intellij.execution.executors.DefaultDebugExecutor
import com.intellij.execution.executors.DefaultRunExecutor
import com.intellij.execution.runners.ExecutionEnvironmentBuilder
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import org.jdom.Element
import java.io.File
import java.nio.file.Files

/**
 * The Mateu App run configuration: it keeps its target and module, refuses what cannot work (desktop
 * on a static bundle, a project with nothing to run) before launching, and Debug is handled by its
 * own runner.
 */
class MateuAppRunConfigurationTest : BasePlatformTestCase() {

    private fun configuration(): MateuAppRunConfiguration =
        RunManager.getInstance(project)
            .createConfiguration("Mateu App", MateuAppConfigurationType::class.java)
            .configuration as MateuAppRunConfiguration

    private fun moduleWith(pom: String): File =
        Files.createTempDirectory("mateu-app").toFile().also { File(it, "pom.xml").writeText(pom) }

    fun testTheTargetAndTheModuleSurviveSavingAndLoading() {
        val saved = configuration().apply {
            target = LaunchTarget.ANDROID_EMULATOR
            moduleDir = "/work/app"
        }
        val element = Element("configuration")
        saved.writeExternal(element)
        val loaded = configuration().apply { readExternal(element) }
        assertEquals(LaunchTarget.ANDROID_EMULATOR, loaded.target)
        assertEquals("/work/app", loaded.moduleDir)
        // a new configuration opens on the web
        assertEquals(LaunchTarget.WEB, configuration().target)
    }

    fun testDesktopCannotOpenAStaticBundleButTheWebCan() {
        val bundle = moduleWith("<project><build><plugins><plugin><artifactId>mateu-bundle-maven-plugin</artifactId></plugin></plugins></build></project>")
        val config = configuration().apply { moduleDir = bundle.path }
        config.target = LaunchTarget.DESKTOP
        assertThrows(RuntimeConfigurationError::class.java) { config.checkConfiguration() }
        config.target = LaunchTarget.WEB
        config.checkConfiguration()
        assertEquals(Framework.STATIC_BUNDLE, config.plan()?.framework)
    }

    fun testAProjectWithNoAppIsRefused() {
        val config = configuration().apply { moduleDir = moduleWith("<project/>").path }
        assertThrows(RuntimeConfigurationError::class.java) { config.checkConfiguration() }
    }

    fun testThePhoneTargetLaunchesTheAppOnTheNetwork() {
        val quarkus = moduleWith("<project><build><plugins><plugin><artifactId>quarkus-maven-plugin</artifactId></plugin></plugins></build></project>")
        val config = configuration().apply { moduleDir = quarkus.path; target = LaunchTarget.PHONE }
        assertTrue(config.plan()!!.command.contains("-Dquarkus.http.host=0.0.0.0"))
        config.target = LaunchTarget.WEB
        assertFalse(config.plan()!!.command.contains("-Dquarkus.http.host=0.0.0.0"))
    }

    fun testRunAndDebugBothBuildTheAppState() {
        val spring = moduleWith("<project><build><plugins><plugin><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build></project>")
        val config = configuration().apply { moduleDir = spring.path }
        for (executor in listOf(DefaultRunExecutor.getRunExecutorInstance(), DefaultDebugExecutor.getDebugExecutorInstance())) {
            val env = ExecutionEnvironmentBuilder.create(executor, config).build()
            assertInstanceOf(config.getState(executor, env), MateuAppState::class.java)
        }
        assertTrue(MateuAppDebugRunner().canRun(DefaultDebugExecutor.EXECUTOR_ID, config))
        assertFalse(MateuAppDebugRunner().canRun(DefaultRunExecutor.EXECUTOR_ID, config))
    }
}
