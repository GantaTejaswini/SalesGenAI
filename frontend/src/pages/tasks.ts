import { router } from '../router';
import { createLayout } from '../components/layout';
import { getTasks, updateTask, createTask, deleteTask, bulkTasksAction, showToast } from '../api';

let currentFilters = {
    q: '',
    priority: '',
    category: '',
    is_completed: '',
    sort_by: 'due_date_asc'
};

let selectedTaskIds: string[] = [];

export function renderTasks() {
  const content = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">Tasks</h1>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Manage your daily sales activities</p>
        </div>
        <div style="display: flex; gap: 1rem;">
            <button class="gradient-btn" onclick="(window as any).openAddTaskModal()">+ New Task</button>
            <button style="background: var(--card-bg); border: 1px solid var(--border-color); color: white; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Export CSV</button>
        </div>
    </div>

    <!-- Filters Bar -->
    <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <input type="text" id="tSearch" placeholder="Search tasks..." style="flex: 1; min-width: 200px; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.5rem 1rem; border-radius: 6px; outline: none;" oninput="(window as any).handleTaskFilterChange()">
        
        <select id="fPriority" onchange="(window as any).handleTaskFilterChange()" style="background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.5rem; border-radius: 6px; outline: none;">
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        </select>

        <select id="fCategory" onchange="(window as any).handleTaskFilterChange()" style="background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.5rem; border-radius: 6px; outline: none;">
            <option value="">All Categories</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Preparation">Preparation</option>
            <option value="Review">Review</option>
        </select>

        <select id="fStatus" onchange="(window as any).handleTaskFilterChange()" style="background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.5rem; border-radius: 6px; outline: none;">
            <option value="">All Statuses</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
        </select>

        <select id="fSort" onchange="(window as any).handleTaskFilterChange()" style="background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.5rem; border-radius: 6px; outline: none;">
            <option value="due_date_asc">Due Date (Earliest)</option>
            <option value="due_date_desc">Due Date (Latest)</option>
            <option value="created_desc">Recently Created</option>
        </select>
    </div>

    <!-- Bulk Actions Bar -->
    <div id="bulkActionBar" class="glass-card" style="display: none; padding: 0.75rem 1.5rem; margin-bottom: 1.5rem; background: rgba(124, 58, 237, 0.1); border: 1px solid var(--primary-color); align-items: center; justify-content: space-between;">
        <div style="font-weight: 600; font-size: 0.95rem; color: white;"><span id="bulkCount">0</span> tasks selected</div>
        <div style="display: flex; gap: 1rem;">
            <button onclick="(window as any).handleBulkAction('complete')" style="background: var(--success-color); border: none; color: white; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Mark Complete</button>
            <button onclick="(window as any).handleBulkAction('reopen')" style="background: var(--card-bg); border: 1px solid var(--border-color); color: white; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Mark Pending</button>
            <button onclick="(window as any).handleBulkAction('delete')" style="background: var(--danger-color); border: none; color: white; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Delete Selected</button>
        </div>
    </div>

    <div style="display: flex; gap: 2rem;">
        <div style="flex: 1;">
            <div class="glass-card" style="padding: 0; margin-bottom: 2rem; overflow: hidden;">
                <div style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; background: rgba(255,255,255,0.02);">
                    <input type="checkbox" id="selectAllTasks" onchange="(window as any).toggleSelectAll(this.checked)" style="width: 16px; height: 16px; margin-right: 1.5rem; cursor: pointer;">
                    <div style="flex: 1; font-weight: 600; font-size: 0.85rem; color: var(--text-secondary);">TASK DETAILS</div>
                    <div style="width: 150px; font-weight: 600; font-size: 0.85rem; color: var(--text-secondary);">DUE DATE</div>
                    <div style="width: 100px; font-weight: 600; font-size: 0.85rem; color: var(--text-secondary); text-align: right;">ACTIONS</div>
                </div>
                <div id="tasksListContainer" style="display: flex; flex-direction: column;">
                    <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Loading tasks...</div>
                </div>
            </div>
        </div>
        
        <div style="width: 350px;">
            <div class="glass-card" style="padding: 1.5rem; position: sticky; top: 100px;">
                <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 600;">Task Summary</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Total Tasks</div>
                    <div style="font-weight: 700; font-size: 1rem; color: white;" id="statTotal">0</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Completed</div>
                    <div style="font-weight: 700; font-size: 1rem; color: var(--success-color);" id="statCompleted">0</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Pending</div>
                    <div style="font-weight: 700; font-size: 1rem; color: var(--warning-color);" id="statPending">0</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">Overdue</div>
                    <div style="font-weight: 700; font-size: 1rem; color: var(--danger-color);" id="statOverdue">0</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase;">Completion %</div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: white;" id="taskProgressText">0%</div>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 2rem;">
                    <div id="taskProgressBar" style="width: 0%; height: 100%; background: var(--success-color); transition: width 0.3s;"></div>
                </div>
                
                <h4 style="margin: 0 0 1rem 0; font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">By Priority</h4>
                <div id="taskTypesSummary" style="display: flex; flex-direction: column; gap: 0.75rem;">
                </div>
            </div>
        </div>
    </div>

    <!-- Add Task Modal -->
    <div id="addTaskModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 600px; padding: 2rem; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; font-size: 1.25rem;">New Task</h2>
          <button onclick="(window as any).closeAddTaskModal()" style="background: transparent; border: none; color: var(--text-secondary); font-size: 1.25rem; cursor: pointer;">&times;</button>
        </div>
        <form id="addTaskForm" onsubmit="(window as any).submitNewTask(event)" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Title</label>
            <input type="text" id="tTitle" required style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Description</label>
            <textarea id="tDesc" rows="3" style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none; resize: vertical;"></textarea>
          </div>
          <div style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
                <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Type</label>
                <select id="tType" style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="To-Do" selected>To-Do</option>
                </select>
            </div>
            <div style="flex: 1;">
                <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Category</label>
                <select id="tCategory" style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
                    <option value="">None</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Preparation">Preparation</option>
                    <option value="Review">Review</option>
                </select>
            </div>
          </div>
          <div style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Priority</label>
              <select id="tPriority" style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
                <option value="Low">Low</option>
                <option value="Medium" selected>Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Due Date & Time</label>
              <input type="datetime-local" id="tDue" style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" onclick="(window as any).closeAddTaskModal()" style="background: transparent; border: 1px solid var(--border-color); color: white; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Cancel</button>
            <button type="submit" class="gradient-btn">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  router.mount(createLayout('/tasks', content));
  
  (window as any).openAddTaskModal = () => { document.getElementById('addTaskModal')!.style.display = 'flex'; };
  (window as any).closeAddTaskModal = () => { document.getElementById('addTaskModal')!.style.display = 'none'; };

  let debounceTimer: any;
  (window as any).handleTaskFilterChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          currentFilters = {
              q: (document.getElementById('tSearch') as HTMLInputElement).value,
              priority: (document.getElementById('fPriority') as HTMLSelectElement).value,
              category: (document.getElementById('fCategory') as HTMLSelectElement).value,
              is_completed: (document.getElementById('fStatus') as HTMLSelectElement).value,
              sort_by: (document.getElementById('fSort') as HTMLSelectElement).value
          };
          loadTasksData();
      }, 300);
  };

  (window as any).toggleSelectAll = (checked: boolean) => {
      const checkboxes = document.querySelectorAll('.task-checkbox') as NodeListOf<HTMLInputElement>;
      selectedTaskIds = [];
      checkboxes.forEach(cb => {
          cb.checked = checked;
          if (checked) selectedTaskIds.push(cb.value);
      });
      updateBulkActionBar();
  };

  (window as any).toggleTaskSelection = (taskId: string, checked: boolean) => {
      if (checked) {
          if (!selectedTaskIds.includes(taskId)) selectedTaskIds.push(taskId);
      } else {
          selectedTaskIds = selectedTaskIds.filter(id => id !== taskId);
      }
      
      const allChecked = document.querySelectorAll('.task-checkbox').length === selectedTaskIds.length && selectedTaskIds.length > 0;
      (document.getElementById('selectAllTasks') as HTMLInputElement).checked = allChecked;
      
      updateBulkActionBar();
  };

  function updateBulkActionBar() {
      const bar = document.getElementById('bulkActionBar')!;
      if (selectedTaskIds.length > 0) {
          bar.style.display = 'flex';
          document.getElementById('bulkCount')!.innerText = selectedTaskIds.length.toString();
      } else {
          bar.style.display = 'none';
      }
  }

  (window as any).handleBulkAction = async (action: string) => {
      if (selectedTaskIds.length === 0) return;
      if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) return;
      
      try {
          await bulkTasksAction(action, selectedTaskIds);
          showToast(`Bulk action '${action}' successful`, 'success');
          selectedTaskIds = [];
          updateBulkActionBar();
          loadTasksData();
      } catch (err: any) {
          showToast(err.message || 'Bulk action failed', 'error');
      }
  };

  (window as any).submitNewTask = async (e: Event) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (btn) btn.innerText = 'Creating...';
      
      const payload = {
          title: (document.getElementById('tTitle') as HTMLInputElement).value,
          description: (document.getElementById('tDesc') as HTMLTextAreaElement).value,
          task_type: (document.getElementById('tType') as HTMLSelectElement).value,
          category: (document.getElementById('tCategory') as HTMLSelectElement).value || undefined,
          priority: (document.getElementById('tPriority') as HTMLSelectElement).value,
          due_date: (document.getElementById('tDue') as HTMLInputElement).value || undefined,
      };
      
      try {
          await createTask(payload);
          showToast('Task created', 'success');
          form.reset();
          (window as any).closeAddTaskModal();
          loadTasksData();
      } catch (err: any) {
          showToast(err.message || 'Failed to create task', 'error');
      } finally {
          if (btn) btn.innerText = 'Create Task';
      }
  };

  (window as any).toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
      try {
          await updateTask(taskId, { is_completed: !currentStatus });
          showToast('Task updated', 'success');
          loadTasksData();
      } catch(e: any) {
          showToast(e.message || 'Failed to update task', 'error');
      }
  };

  (window as any).deleteTaskItem = async (taskId: string) => {
      if (!confirm('Are you sure you want to delete this task?')) return;
      try {
          await deleteTask(taskId);
          showToast('Task deleted successfully', 'success');
          loadTasksData();
      } catch(e: any) {
          showToast(e.message || 'Failed to delete task', 'error');
      }
  };

  (window as any).duplicateTaskItem = async (_taskId: string) => {
      showToast('Task duplicated (simulated)', 'success');
      loadTasksData();
  };

  loadTasksData();
}

async function loadTasksData() {
    try {
        const queryParams: any = { ...currentFilters };
        // Remove empty strings
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === '') delete queryParams[key];
        });
        
        const res = await getTasks(queryParams);
        const allTasks = res.data || [];
        
        const containerEl = document.getElementById('tasksListContainer')!;
        
        if (allTasks.length === 0) {
            containerEl.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-secondary);">No tasks found matching criteria</div>';
        } else {
            containerEl.innerHTML = allTasks.map((t: any) => renderTaskRow(t)).join('');
            
            // Re-check boxes if they were selected before load
            document.querySelectorAll('.task-checkbox').forEach((cb: any) => {
                if (selectedTaskIds.includes(cb.value)) cb.checked = true;
            });
        }
        
        updateStatistics(allTasks);
        
    } catch (e: any) {
        showToast('Failed to load tasks', 'error');
    }
}

function updateStatistics(tasks: any[]) {
    const totalCount = tasks.length;
    const compCount = tasks.filter(t => t.is_completed).length;
    const pendingCount = totalCount - compCount;
    
    let overdueCount = 0;
    const now = new Date();
    tasks.forEach(t => {
        if (!t.is_completed && t.due_date && new Date(t.due_date) < now) {
            overdueCount++;
        }
    });

    document.getElementById('statTotal')!.innerText = totalCount.toString();
    document.getElementById('statCompleted')!.innerText = compCount.toString();
    document.getElementById('statPending')!.innerText = pendingCount.toString();
    document.getElementById('statOverdue')!.innerText = overdueCount.toString();
    
    const pct = totalCount > 0 ? Math.round((compCount/totalCount)*100) : 0;
    document.getElementById('taskProgressText')!.innerText = `${pct}%`;
    document.getElementById('taskProgressBar')!.style.width = `${pct}%`;
    
    const priorities: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => {
        if (!t.is_completed) {
            priorities[t.priority] = (priorities[t.priority] || 0) + 1;
        }
    });
    
    document.getElementById('taskTypesSummary')!.innerHTML = Object.keys(priorities).map(k => `
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${k==='High'?'var(--danger-color)':(k==='Medium'?'var(--warning-color)':'var(--success-color)')};"></div>${k}
            </div>
            <span style="font-weight: 600;">${priorities[k]}</span>
        </div>
    `).join('');
}

function renderTaskRow(t: any) {
    let pColor = 'var(--text-secondary)';
    if (t.priority === 'High') pColor = 'var(--danger-color)';
    else if (t.priority === 'Medium') pColor = 'var(--warning-color)';
    
    const isOverdue = !t.is_completed && t.due_date && new Date(t.due_date) < new Date();
    const dateStr = t.due_date ? new Date(t.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : 'No Due Date';
    
    const catBadge = t.category ? `<span style="background: rgba(255,255,255,0.1); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">${t.category}</span>` : '';
    const descText = t.description ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">${t.description}</div>` : '';

    return `
        <div class="task-row" style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
            <input type="checkbox" class="task-checkbox" value="${t.id}" onchange="(window as any).toggleTaskSelection('${t.id}', this.checked)" style="width: 16px; height: 16px; margin-right: 1.5rem; cursor: pointer;">
            
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.2rem;">
                    <div style="font-weight: 600; font-size: 0.95rem; ${t.is_completed ? 'text-decoration: line-through; color: var(--text-secondary);' : 'color: white;'}">${t.title}</div>
                    ${catBadge}
                    ${isOverdue ? `<span style="background: rgba(239, 68, 68, 0.2); color: var(--danger-color); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">Overdue</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
                    <span><span style="color: ${pColor}; font-weight: 600;">&bull;</span> ${t.priority}</span>
                    <span>${t.task_type}</span>
                </div>
                ${descText}
            </div>
            
            <div style="width: 150px; color: ${t.is_completed ? 'var(--text-secondary)' : (isOverdue ? 'var(--danger-color)' : 'white')}; font-size: 0.85rem;">
                ${dateStr}
            </div>
            
            <div style="width: 100px; display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center;">
                <button type="button" class="icon-btn" onclick="(window as any).toggleTaskStatus('${t.id}', ${t.is_completed})" style="padding: 0.3rem; color: ${t.is_completed ? 'var(--warning-color)' : 'var(--success-color)'}; font-size: 1rem; border: none; background: transparent; cursor: pointer;" title="${t.is_completed ? 'Reopen' : 'Complete'}">${t.is_completed ? '↺' : '✓'}</button>
                <button type="button" class="icon-btn" onclick="(window as any).duplicateTaskItem('${t.id}')" style="padding: 0.3rem; color: var(--secondary-color); font-size: 1rem; border: none; background: transparent; cursor: pointer;" title="Duplicate">⎘</button>
                <button type="button" class="icon-btn" onclick="(window as any).deleteTaskItem('${t.id}')" style="padding: 0.3rem; color: var(--danger-color); font-size: 1rem; border: none; background: transparent; cursor: pointer;" title="Delete">🗑️</button>
            </div>
        </div>
    `;
}
