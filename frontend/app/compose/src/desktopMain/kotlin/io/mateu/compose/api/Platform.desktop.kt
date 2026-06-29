package io.mateu.compose.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO

/** Desktop (JVM) Ktor engine. Android would use OkHttp, iOS Darwin, web Js. */
actual fun createHttpClient(): HttpClient = HttpClient(CIO)
