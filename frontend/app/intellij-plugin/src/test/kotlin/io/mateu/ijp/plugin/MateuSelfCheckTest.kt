package io.mateu.ijp.plugin

import junit.framework.TestCase

/** The startup self-check the desktop smoke test reads (3.0-beta.64: Jackson unreachable on 2026.3). */
class MateuSelfCheckTest : TestCase() {

    fun testEveryRequiredClassIsReachableFromThePluginsOwnClassloader() {
        // the test classpath has the platform + the bundled libraries: nothing may be missing here
        assertEquals(emptyList<String>(), MateuSelfCheck.missing(MateuSelfCheck.REQUIRED_CLASSES, MateuSelfCheck::class.java.classLoader))
    }

    fun testAClassTheLoaderCannotReachIsReported() {
        // the bootstrap classloader sees the JDK and nothing else — the beta.64 situation, for Jackson
        val bootstrapOnly = object : ClassLoader(null) {}
        val missing = MateuSelfCheck.missing(listOf("java.lang.String", "com.fasterxml.jackson.databind.ObjectMapper"), bootstrapOnly)
        assertEquals(listOf("com.fasterxml.jackson.databind.ObjectMapper"), missing)
    }

    fun testTheLogLineTheSmokeTestReads() {
        assertTrue(MateuSelfCheck.report(emptyList()).startsWith("Mateu self-check: OK"))
        val failed = MateuSelfCheck.report(listOf("com.fasterxml.jackson.databind.ObjectMapper"))
        assertTrue(failed.startsWith("Mateu self-check FAILED"))
        assertTrue(failed.contains("com.fasterxml.jackson.databind.ObjectMapper"))
    }
}
