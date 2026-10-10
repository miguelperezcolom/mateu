package io.mateu.ijp.live

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.file.Files

class LiveRunPlanTest {

    private val springPom = """
        <project><parent><artifactId>spring-boot-starter-parent</artifactId></parent>
        <build><plugins><plugin><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build>
        </project>
    """.trimIndent()

    @Test
    fun `the framework comes from the build file`() {
        assertEquals(Framework.SPRING_BOOT, frameworkOf(springPom))
        assertEquals(Framework.QUARKUS, frameworkOf("<artifactId>quarkus-maven-plugin</artifactId>"))
        assertEquals(Framework.MICRONAUT, frameworkOf("id(\"io.micronaut.application\")"))
        assertEquals(Framework.HELIDON, frameworkOf("<groupId>io.helidon.applications</groupId>"))
        assertEquals(Framework.UNKNOWN, frameworkOf("<project/>"))
    }

    @Test
    fun `a Spring Boot maven app runs spring-boot run with the debug agent and dev mode`() {
        val specs = File("/work/app/src/main/resources/specs/ui")
        val plan = liveRunPlan(File("/work/app"), BuildTool.MAVEN, springPom, "server.port=8093\n",
            listOf(specs), isWindows = false)
        assertEquals("mvn", plan.command[0])
        assertEquals("spring-boot:run", plan.command[1])
        val jvm = plan.command[2]
        assertTrue(jvm, jvm.startsWith("-Dspring-boot.run.jvmArguments="))
        assertTrue(jvm, "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" in jvm)
        assertTrue(jvm, "-Dmateu.dev=true" in jvm)
        assertTrue(jvm, "-Dmateu.dev.specs-dir=${specs.absolutePath}" in jvm)
        assertEquals("true", plan.environment["MATEU_DEV"])
        assertEquals(specs.absolutePath, plan.environment["MATEU_DEV_SPECS_DIR"])
        assertEquals("http://localhost:8093", plan.appUrl)
        assertEquals(5005, plan.debugPort)
    }

    @Test
    fun `quarkus runs quarkus dev, micronaut mn run, gradle bootRun with the debug jvm`() {
        val quarkus = liveRunPlan(File("."), BuildTool.MAVEN, "quarkus-maven-plugin", "quarkus.http.port=9000",
            emptyList(), isWindows = false)
        assertEquals(listOf("mvn", "quarkus:dev", "-Dmateu.dev=true"), quarkus.command)
        assertEquals("http://localhost:9000", quarkus.appUrl)
        assertFalse(quarkus.environment.containsKey("MATEU_DEV_SPECS_DIR"))

        val micronaut = liveRunPlan(File("."), BuildTool.MAVEN, "micronaut-maven-plugin", "", emptyList(),
            isWindows = false)
        assertEquals("mn:run", micronaut.command[1])
        assertTrue(micronaut.command.contains("-Dmn.debug=true"))

        val gradle = liveRunPlan(File("."), BuildTool.GRADLE, "id(\"org.springframework.boot\")", "", emptyList(),
            isWindows = false)
        assertEquals(listOf("./gradlew", "bootRun", "--debug-jvm"), gradle.command)
        assertEquals("true", gradle.environment["MATEU_DEV"])
    }

    @Test
    fun `the app module is the one that declares a runnable app, and specs dirs are found`() {
        val root = Files.createTempDirectory("mateu-live").toFile()
        try {
            File(root, "pom.xml").writeText("<project><modules><module>ui</module><module>app</module></modules></project>")
            File(root, "ui").mkdirs()
            File(root, "ui/pom.xml").writeText("<project><dependency>org.springframework.boot</dependency></project>")
            File(root, "ui/src/main/resources/specs/ui").mkdirs()
            File(root, "app").mkdirs()
            File(root, "app/pom.xml").writeText(springPom)
            assertEquals(File(root, "app").canonicalPath, appModuleOf(root).canonicalPath)
            val dirs = specsDirsOf(root).map { it.canonicalPath }
            assertEquals(listOf(File(root, "ui/src/main/resources/specs/ui").canonicalPath), dirs)
            val plan = liveRunPlanOf(File(root, "app"), root)!!
            assertEquals(Framework.SPRING_BOOT, plan.framework)
            assertTrue(plan.environment["MATEU_DEV_SPECS_DIR"]!!.endsWith("ui/src/main/resources/specs/ui"))
        } finally {
            root.deleteRecursively()
        }
    }

    @Test
    fun `the reload endpoint lives at the server root`() {
        assertEquals("http://localhost:8080/mateu/dev/reload", MateuDevClient.reloadUrl("http://localhost:8080/console"))
        assertEquals("http://localhost:8080/mateu/dev/reload?scope=app",
            MateuDevClient.reloadUrl("http://localhost:8080", "app"))
        assertFalse(MateuDevClient.reload("http://localhost:1"))
    }
}
