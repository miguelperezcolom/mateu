package io.mateu.ijp.plugin

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.RoamingType
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage
import io.mateu.ijp.state.StoredTask
import io.mateu.ijp.state.TaskLedgerStore
import io.mateu.ijp.state.TaskOriginEntry

/**
 * The running tasks to pick up again when the IDE is opened (the rules are
 * [io.mateu.ijp.state.TaskLedgers]). Application level like the ledgers; never roams with the
 * settings: a task id belongs to this machine's run.
 */
@Service(Service.Level.APP)
@State(name = "MateuTasks", storages = [Storage(value = "mateu-tasks.xml", roamingType = RoamingType.DISABLED)])
class MateuTaskStore : PersistentStateComponent<MateuTaskStore.StateBean>, TaskLedgerStore {

    /** XML-serializable shape (the platform serializer wants mutable beans with defaults). */
    class TaskBean {
        var taskId: String = ""
        var baseUrl: String = ""
        var scope: String = ""
        var route: String? = null
        var serverSideType: String? = null
        var rememberedAt: Long = 0
    }

    class StateBean {
        var tasks: MutableList<TaskBean> = mutableListOf()
    }

    @Volatile private var bean = StateBean()

    override fun getState(): StateBean = bean

    override fun loadState(state: StateBean) {
        bean = state
    }

    override fun load(): List<StoredTask> = bean.tasks.map {
        StoredTask(TaskOriginEntry(it.taskId, it.baseUrl, it.route, it.serverSideType), it.rememberedAt, it.scope)
    }

    override fun save(tasks: List<StoredTask>) {
        // a fresh bean: the platform may be serialising the previous one on another thread
        bean = StateBean().apply {
            this.tasks = tasks.mapTo(mutableListOf()) { task ->
                TaskBean().apply {
                    taskId = task.origin.taskId
                    baseUrl = task.origin.baseUrl
                    scope = task.scope
                    route = task.origin.route
                    serverSideType = task.origin.serverSideType
                    rememberedAt = task.rememberedAt
                }
            }
        }
    }

    companion object {
        fun getInstance(): MateuTaskStore = ApplicationManager.getApplication().getService(MateuTaskStore::class.java)
    }
}
