package io.mateu.compose.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.darwin.Darwin

/** iOS Ktor engine. */
actual fun createHttpClient(): HttpClient = HttpClient(Darwin)
