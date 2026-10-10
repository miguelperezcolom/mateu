package io.mateu.ijp.newfile

import io.mateu.ijp.newfile.ProjectDescriptor.Renderer
import junit.framework.TestCase

class ProjectDescriptorTest : TestCase() {

    fun testAbsentOrUndeclaredRendererIsVaadin() {
        assertEquals(Renderer.VAADIN, ProjectDescriptor.rendererOf(null))
        assertEquals(Renderer.VAADIN, ProjectDescriptor.rendererOf(""))
        assertEquals(Renderer.VAADIN, ProjectDescriptor.rendererOf("type: Project\n"))
        assertEquals(Renderer.VAADIN, ProjectDescriptor.rendererOf("type: Project\nrenderer: nonsense\n"))
        assertEquals(Renderer.VAADIN, ProjectDescriptor.rendererOf("{{ not yaml"))
    }

    fun testReadsTheDeclaredRenderer() {
        assertEquals(Renderer.REDWOOD, ProjectDescriptor.rendererOf("type: Project\nrenderer: redwood   # vaadin | redwood\n"))
        assertEquals(Renderer.REDWOOD, ProjectDescriptor.rendererOf("type: Project\nrenderer: Redwood\n"))
        assertTrue(ProjectDescriptor.isProject("type: Project\n"))
        assertFalse(ProjectDescriptor.isProject("type: UI\n"))
    }

    fun testWithRendererReplacesOnlyTheRendererLine() {
        val before = "# my notes\ntype: Project\nrenderer: vaadin   # the default\nfuture: kept\n"
        val after = ProjectDescriptor.withRenderer(before, Renderer.REDWOOD)
        assertEquals("# my notes\ntype: Project\nrenderer: redwood   # the default\nfuture: kept\n", after)
        assertEquals(Renderer.REDWOOD, ProjectDescriptor.rendererOf(after))
    }

    fun testWithRendererAddsTheKeyAfterType() {
        assertEquals("type: Project\nrenderer: redwood\n# end\n", ProjectDescriptor.withRenderer("type: Project\n# end\n", Renderer.REDWOOD))
    }

    fun testABlankFileBecomesAFreshDescriptor() {
        val text = ProjectDescriptor.withRenderer(null, Renderer.REDWOOD)
        assertTrue(ProjectDescriptor.isProject(text))
        assertEquals(Renderer.REDWOOD, ProjectDescriptor.rendererOf(text))
    }

    fun testTheArtifactMappingIsTheOneConstant() {
        assertEquals("io.mateu:vaadin-lit", Renderer.VAADIN.coordinates)
        assertEquals("io.mateu:redwood", Renderer.REDWOOD.coordinates)
        assertTrue(ProjectDescriptor.dependencyXml(Renderer.REDWOOD).contains("<artifactId>redwood</artifactId>"))
    }

    fun testTheBundledSkeletonIsADescriptor() {
        val text = MateuNewFiles.bundledTemplateText("Mateu Project")
        assertTrue(ProjectDescriptor.isProject(text))
        assertEquals(Renderer.VAADIN, ProjectDescriptor.rendererOf(text))
        assertTrue(MateuNewFiles.catalogue.files.single { it.id == "project" }.singleton)
    }
}
