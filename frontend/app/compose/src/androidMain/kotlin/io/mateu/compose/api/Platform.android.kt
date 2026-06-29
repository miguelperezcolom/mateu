package io.mateu.compose.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp

/** Android Ktor engine. */
actual fun createHttpClient(): HttpClient = HttpClient(OkHttp)
