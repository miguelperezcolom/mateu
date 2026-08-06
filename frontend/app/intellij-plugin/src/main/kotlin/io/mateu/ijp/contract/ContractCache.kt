package io.mateu.ijp.contract

import com.intellij.codeInsight.daemon.DaemonCodeAnalyzer
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.project.Project
import java.util.Optional
import java.util.concurrent.ConcurrentHashMap

/**
 * Per-project cache of ModelView contracts fetched from the backend. The annotator runs on the
 * read/UI thread and must not block on HTTP, so [get] returns whatever is cached NOW (or null) and,
 * on a miss, schedules a one-off background fetch; when it completes it restarts the code analyzer
 * so the annotator runs again — now with the contract in hand. A failed fetch (backend down) caches
 * an empty result so a broken connection isn't hammered on every keystroke; [invalidate] retries.
 */
@Service(Service.Level.PROJECT)
class ContractCache(private val project: Project) {

  /** Tests disable the network so only seeded contracts are used (no real HTTP). */
  @Volatile
  var networkEnabled: Boolean = true

  private val cache = ConcurrentHashMap<String, Optional<ModelViewContract>>()
  private val inFlight = ConcurrentHashMap.newKeySet<String>()

  /** The cached contract for [fqn], or null on a miss (which schedules a background fetch). */
  fun get(fqn: String): ModelViewContract? {
    cache[fqn]?.let { return it.orElse(null) }
    if (networkEnabled && inFlight.add(fqn)) fetchAsync(fqn)
    return null
  }

  /** Inject a contract directly (a manual refresh, or tests). */
  fun seed(fqn: String, contract: ModelViewContract?) {
    cache[fqn] = Optional.ofNullable(contract)
  }

  fun invalidate() {
    cache.clear()
    inFlight.clear()
  }

  private fun fetchAsync(fqn: String) {
    ApplicationManager.getApplication().executeOnPooledThread {
      val contract = try {
        ContractClient.fetch(fqn)
      } catch (e: Exception) {
        null
      }
      cache[fqn] = Optional.ofNullable(contract)
      inFlight.remove(fqn)
      ApplicationManager.getApplication().invokeLater(
        { if (!project.isDisposed) DaemonCodeAnalyzer.getInstance(project).restart() },
        { project.isDisposed },
      )
    }
  }

  companion object {
    fun getInstance(project: Project): ContractCache = project.getService(ContractCache::class.java)
  }
}
