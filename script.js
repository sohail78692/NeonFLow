// ===== Global State =====
const state = {
    tasks: [],
    currentView: 'landing', // start on landing view
    currentTheme: 'cyberpunk',
    isDarkMode: true,
    userLevel: 1,
    userXP: 0,
    userStreak: 0,
    lastActiveDate: null,
    pomodoroTimer: null,
    pomodoroMinutes: 25,
    pomodoroSeconds: 0,
    isPomodoroRunning: false,
    ambientSound: null,
    searchQuery: '',
    sortBy: 'date',
    filters: {
        status: 'all',
        priority: 'all',
        category: 'all'
    },
    draggedTask: null,
    draggedOver: null,
    websocket: null,
    collaborationEnabled: false
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadFromLocalStorage();
    updateUI();
    setupCustomCursor();
    requestNotificationPermission();
    loadMotivationalQuote();
});

function initializeApp() {
    // Set current date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Initialize calendar
    initializeCalendar();

    // Initialize charts
    initializeCharts();

    // Check streak
    
    // Initialize timer display
    if (state.pomodoroMinutes) {
        updateTimerDisplay();
    } else {
        state.pomodoroMinutes = 25;
        state.pomodoroSeconds = 0;
        updateTimerDisplay();
    }
    
    checkStreak();
}

// ===== Custom Cursor =====
function setupCustomCursor() {
    const cursor = document.querySelector('.neon-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden')) {
                searchInput.focus();
            }
        });
    }

    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            searchBar.classList.add('hidden');
            searchInput.value = '';
            state.searchQuery = '';
            updateTasksView();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase();
            updateTasksView();
        });
    }

    // Filters
    const filterBtn = document.getElementById('filterBtn');
    const filterPanel = document.getElementById('filterPanel');
    const sortSelect = document.getElementById('sortSelect');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            filterPanel.classList.toggle('hidden');
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            updateTasksView();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            state.filters.status = e.target.value;
            updateTasksView();
        });
    }

    if (priorityFilter) {
        priorityFilter.addEventListener('change', (e) => {
            state.filters.priority = e.target.value;
            updateTasksView();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            updateTasksView();
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleDarkMode();
        });
    }

    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            openTaskModal();
        });
    }

    // Task modal
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.getElementById('closeModal');
    const cancelTask = document.getElementById('cancelTask');
    const saveTask = document.getElementById('saveTask');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            taskModal.classList.add('hidden');
        });
    }

    if (cancelTask) {
        cancelTask.addEventListener('click', () => {
            taskModal.classList.add('hidden');
        });
    }

    if (saveTask) {
        saveTask.addEventListener('click', () => {
            saveTaskFromModal();
        });
    }

    // AI features
    setupAIEventListeners();

    // Pomodoro timer
    setupPomodoroListeners();

    // Settings
    setupSettingsListeners();

    // Drag and drop
    setupDragAndDrop();

    // Landing page buttons
    const getStartedBtn = document.getElementById('getStartedBtn');
    const getStartedBtn2 = document.getElementById('getStartedBtn2');
    
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            switchView('tasks');
            playSound('success');
        });
    }

    if (getStartedBtn2) {
        getStartedBtn2.addEventListener('click', () => {
            switchView('tasks');
            playSound('success');
        });
    }
}

// ===== View Switching =====
function switchView(view) {
    state.currentView = view;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });

    const viewMap = {
        'landing': 'landingView',
        'tasks': 'tasksView',
        'kanban': 'kanbanView',
        'calendar': 'calendarView',
        'pomodoro': 'pomodoroView',
        'analytics': 'analyticsView',
        'settings': 'settingsView'
    };

    const viewTitleMap = {
        'landing': 'Welcome to NeonFlow',
        'tasks': 'My Tasks',
        'kanban': 'Kanban Board',
        'calendar': 'Calendar',
        'pomodoro': 'Focus Timer',
        'analytics': 'Analytics',
        'settings': 'Settings'
    };

    const viewId = viewMap[view];
    if (viewId) {
        const viewEl = document.getElementById(viewId);
        if (viewEl) {
            viewEl.classList.add('active');
        }
    }

    const titleEl = document.getElementById('currentViewTitle');
    if (titleEl) {
        titleEl.textContent = viewTitleMap[view] || 'My Tasks';
    }

    // Update view-specific content
    if (view === 'tasks') {
        updateTasksView();
    } else if (view === 'kanban') {
        updateKanbanView();
    } else if (view === 'calendar') {
        updateCalendarView();
    } else if (view === 'analytics') {
        updateAnalyticsView();
    }
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar')?.classList.remove('open');
    }
}

// ===== Task Management =====
function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const taskName = document.getElementById('taskName');
    const taskDescription = document.getElementById('taskDescription');
    const taskPriority = document.getElementById('taskPriority');
    const taskCategory = document.getElementById('taskCategory');
    const taskDueDate = document.getElementById('taskDueDate');
    const taskEstimatedTime = document.getElementById('taskEstimatedTime');
    const taskHasSubtasks = document.getElementById('taskHasSubtasks');
    const subtasksContainer = document.getElementById('subtasksContainer');
    const subtasksList = document.getElementById('subtasksList');

    if (taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            modalTitle.textContent = 'Edit Task';
            taskName.value = task.name;
            taskDescription.value = task.description || '';
            taskPriority.value = task.priority;
            taskCategory.value = task.category || '';
            taskDueDate.value = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '';
            taskEstimatedTime.value = task.estimatedTime || '';
            taskHasSubtasks.checked = task.subtasks && task.subtasks.length > 0;
            
            if (task.subtasks && task.subtasks.length > 0) {
                subtasksContainer.classList.remove('hidden');
                subtasksList.innerHTML = '';
                task.subtasks.forEach((subtask, index) => {
                    addSubtaskInput(subtask.name, subtask.completed, index);
                });
            }
        }
    } else {
        modalTitle.textContent = 'Add New Task';
        taskName.value = '';
        taskDescription.value = '';
        taskPriority.value = 'medium';
        taskCategory.value = '';
        taskDueDate.value = '';
        taskEstimatedTime.value = '';
        taskHasSubtasks.checked = false;
        subtasksContainer.classList.add('hidden');
        subtasksList.innerHTML = '';
    }

    modal.dataset.taskId = taskId || '';
    modal.classList.remove('hidden');
    playSound('open');
}

function addSubtaskInput(name = '', completed = false, index = null) {
    const subtasksList = document.getElementById('subtasksList');
    const div = document.createElement('div');
    div.className = 'subtask-input';
    div.innerHTML = `
        <input type="checkbox" ${completed ? 'checked' : ''} class="subtask-checkbox" data-index="${index}">
        <input type="text" class="form-input subtask-name" value="${name}" placeholder="Subtask name...">
        <button type="button" class="task-action-btn remove-subtask">
            <i class="fas fa-times"></i>
        </button>
    `;
    subtasksList.appendChild(div);

    div.querySelector('.remove-subtask').addEventListener('click', () => {
        div.remove();
    });
}

document.getElementById('taskHasSubtasks')?.addEventListener('change', (e) => {
    const container = document.getElementById('subtasksContainer');
    if (e.target.checked) {
        container.classList.remove('hidden');
        if (container.querySelectorAll('.subtask-input').length === 0) {
            addSubtaskInput();
        }
    } else {
        container.classList.add('hidden');
    }
});

document.getElementById('addSubtask')?.addEventListener('click', () => {
    addSubtaskInput();
});

function saveTaskFromModal() {
    const modal = document.getElementById('taskModal');
    const taskId = modal.dataset.taskId;
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskPriority = document.getElementById('taskPriority').value;
    const taskCategory = document.getElementById('taskCategory').value.trim();
    const taskDueDate = document.getElementById('taskDueDate').value;
    const taskEstimatedTime = document.getElementById('taskEstimatedTime').value;
    const taskHasSubtasks = document.getElementById('taskHasSubtasks').checked;

    if (!taskName) {
        showNotification('Task name is required', 'warning');
        return;
    }

    const subtasks = [];
    if (taskHasSubtasks) {
        document.querySelectorAll('.subtask-input').forEach((input, index) => {
            const name = input.querySelector('.subtask-name').value.trim();
            const completed = input.querySelector('.subtask-checkbox').checked;
            if (name) {
                subtasks.push({ name, completed, id: Date.now() + index });
            }
        });
    }

    const taskData = {
        name: taskName,
        description: taskDescription,
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        estimatedTime: taskEstimatedTime ? parseInt(taskEstimatedTime) : null,
        subtasks: subtasks,
        completed: false,
        createdAt: taskId ? state.tasks.find(t => t.id === taskId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (taskId) {
        updateTask(taskId, taskData);
    } else {
        createTask(taskData);
    }

    modal.classList.add('hidden');
    playSound('success');
}

function createTask(taskData) {
    const task = {
        id: Date.now().toString(),
        ...taskData,
        status: 'todo',
        order: state.tasks.length
    };

    state.tasks.push(task);
    saveToLocalStorage();
    updateUI();
    showNotification('Task created successfully!', 'success');
    
    // Update categories filter
    updateCategoryFilter();
}

function updateTask(taskId, taskData) {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...taskData };
        saveToLocalStorage();
        updateUI();
        showNotification('Task updated successfully!', 'success');
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        saveToLocalStorage();
        updateUI();
        showNotification('Task deleted', 'info');
        playSound('delete');
    }
}

function toggleTaskComplete(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        
        if (task.completed) {
            addXP(10);
            triggerConfetti();
            checkStreak();
            playSound('complete');
        }
        
        saveToLocalStorage();
        updateUI();
    }
}

function updateTasksView() {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    
    if (!tasksList) return;

    let filteredTasks = [...state.tasks];

    // Apply search
    if (state.searchQuery) {
        filteredTasks = filteredTasks.filter(task =>
            task.name.toLowerCase().includes(state.searchQuery) ||
            task.description.toLowerCase().includes(state.searchQuery) ||
            task.category.toLowerCase().includes(state.searchQuery)
        );
    }

    // Apply filters
    if (state.filters.status !== 'all') {
        if (state.filters.status === 'active') {
            filteredTasks = filteredTasks.filter(t => !t.completed);
        } else if (state.filters.status === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.completed);
        }
    }

    if (state.filters.priority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === state.filters.priority);
    }

    if (state.filters.category !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.category === state.filters.category);
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
        switch (state.sortBy) {
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'name':
                return a.name.localeCompare(b.name);
            case 'dueDate':
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            case 'date':
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        tasksList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
        
        // Reattach event listeners
        attachTaskEventListeners();
    }
}

function createTaskHTML(task) {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
    const subtasksHTML = task.subtasks && task.subtasks.length > 0
        ? `<div class="subtasks-list">
            ${task.subtasks.map(subtask => `
                <div class="subtask-item">
                    <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''} 
                           data-task-id="${task.id}" data-subtask-id="${subtask.id}">
                    <span class="${subtask.completed ? 'completed' : ''}">${subtask.name}</span>
                </div>
            `).join('')}
        </div>`
        : '';

    return `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" draggable="true">
            <div class="task-header">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
                <div class="task-content">
                    <div class="task-name">${escapeHtml(task.name)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        ${task.category ? `<span class="task-category">${escapeHtml(task.category)}</span>` : ''}
                        ${dueDate ? `<div class="task-due-date">
                            <i class="fas fa-calendar"></i>
                            <span>${dueDate}</span>
                        </div>` : ''}
                        ${task.estimatedTime ? `<div class="task-due-date">
                            <i class="fas fa-clock"></i>
                            <span>${task.estimatedTime} min</span>
                        </div>` : ''}
                    </div>
                    ${subtasksHTML}
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task" data-task-id="${task.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task" data-task-id="${task.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function attachTaskEventListeners() {
    // Checkbox toggle
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = checkbox.dataset.taskId;
            toggleTaskComplete(taskId);
        });
    });

    // Edit task
    document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = btn.dataset.taskId;
            openTaskModal(taskId);
        });
    });

    // Delete task
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = btn.dataset.taskId;
            deleteTask(taskId);
        });
    });

    // Subtask checkbox
    document.querySelectorAll('.subtask-checkbox[data-subtask-id]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = checkbox.dataset.taskId;
            const subtaskId = checkbox.dataset.subtaskId;
            toggleSubtaskComplete(taskId, subtaskId);
        });
    });
}

function toggleSubtaskComplete(taskId, subtaskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.subtasks) {
        const subtask = task.subtasks.find(s => s.id == subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            saveToLocalStorage();
            updateUI();
        }
    }
}

function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;

    const categories = [...new Set(state.tasks.map(t => t.category).filter(c => c))];
    const currentValue = categoryFilter.value;

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = currentValue;
}

// ===== Kanban Board =====
function updateKanbanView() {
    const todoList = document.getElementById('kanbanTodo');
    const inProgressList = document.getElementById('kanbanInProgress');
    const completedList = document.getElementById('kanbanCompleted');

    const todoTasks = state.tasks.filter(t => !t.completed && (t.status === 'todo' || !t.status));
    const inProgressTasks = state.tasks.filter(t => !t.completed && t.status === 'in-progress');
    const completedTasks = state.tasks.filter(t => t.completed || t.status === 'completed');

    document.getElementById('todoCount').textContent = todoTasks.length;
    document.getElementById('inProgressCount').textContent = inProgressTasks.length;
    document.getElementById('completedCount').textContent = completedTasks.length;

    todoList.innerHTML = todoTasks.map(task => createKanbanTaskHTML(task)).join('');
    inProgressList.innerHTML = inProgressTasks.map(task => createKanbanTaskHTML(task)).join('');
    completedList.innerHTML = completedTasks.map(task => createKanbanTaskHTML(task)).join('');

    attachKanbanEventListeners();
}

function createKanbanTaskHTML(task) {
    return `
        <div class="kanban-task" data-task-id="${task.id}" draggable="true">
            <div class="task-name">${escapeHtml(task.name)}</div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <span class="task-priority ${task.priority}">${task.priority}</span>
                ${task.category ? `<span class="task-category">${escapeHtml(task.category)}</span>` : ''}
            </div>
        </div>
    `;
}

function attachKanbanEventListeners() {
    document.querySelectorAll('.kanban-task').forEach(task => {
        task.addEventListener('click', () => {
            const taskId = task.dataset.taskId;
            openTaskModal(taskId);
        });
    });
}

// ===== Calendar =====
let currentCalendarDate = new Date();

function initializeCalendar() {
    updateCalendarView();
    
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        updateCalendarView();
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        updateCalendarView();
    });
}

function updateCalendarView() {
    const monthEl = document.getElementById('calendarMonth');
    const gridEl = document.getElementById('calendarGrid');
    
    if (!monthEl || !gridEl) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    monthEl.textContent = new Date(year, month).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    gridEl.innerHTML = '';

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day';
        header.style.fontWeight = '600';
        header.style.textAlign = 'center';
        header.style.padding = '0.5rem';
        header.style.border = 'none';
        header.style.background = 'transparent';
        header.style.cursor = 'default';
        header.textContent = day;
        gridEl.appendChild(header);
    });

    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = new Date(year, month, -i).getDate();
        gridEl.appendChild(day);
    }

    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        
        const dateStr = new Date(year, month, i).toDateString();
        const tasksOnDay = state.tasks.filter(t => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate).toDateString() === dateStr;
        });

        if (tasksOnDay.length > 0) {
            day.classList.add('has-tasks');
            day.addEventListener('click', () => {
                showDayTasks(dateStr, tasksOnDay);
            });
        }

        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            day.classList.add('today');
        }

        gridEl.appendChild(day);
    }

    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        gridEl.appendChild(day);
    }
}

function showDayTasks(dateStr, tasks) {
    const message = `Tasks on ${new Date(dateStr).toLocaleDateString()}:\n${tasks.map(t => `- ${t.name}`).join('\n')}`;
    alert(message);
}

// ===== Pomodoro Timer =====
function setupPomodoroListeners() {
    document.getElementById('timerStart')?.addEventListener('click', startPomodoro);
    document.getElementById('timerPause')?.addEventListener('click', pausePomodoro);
    document.getElementById('timerReset')?.addEventListener('click', resetPomodoro);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const minutes = parseInt(btn.dataset.minutes);
            setPomodoroTime(minutes);
        });
    });

    document.getElementById('ambientSound')?.addEventListener('change', (e) => {
        changeAmbientSound(e.target.value);
    });
}

function setPomodoroTime(minutes) {
    // Stop timer if running
    if (state.isPomodoroRunning) {
        pausePomodoro();
    }
    
    state.pomodoroMinutes = minutes;
    state.pomodoroSeconds = 0;
    updateTimerDisplay();
}

function startPomodoro() {
    if (state.isPomodoroRunning) return;
    
    state.isPomodoroRunning = true;
    state.pomodoroTimer = setInterval(() => {
        if (state.pomodoroSeconds > 0) {
            state.pomodoroSeconds--;
        } else if (state.pomodoroMinutes > 0) {
            state.pomodoroMinutes--;
            state.pomodoroSeconds = 59;
        } else {
            completePomodoro();
            return;
        }
        updateTimerDisplay();
    }, 1000);

    playSound('start');
}

function pausePomodoro() {
    state.isPomodoroRunning = false;
    if (state.pomodoroTimer) {
        clearInterval(state.pomodoroTimer);
        state.pomodoroTimer = null;
    }
    playSound('pause');
}

function resetPomodoro() {
    pausePomodoro();
    const defaultMinutes = state.pomodoroMinutes || 25;
    state.pomodoroMinutes = defaultMinutes;
    state.pomodoroSeconds = 0;
    updateTimerDisplay();
}

function completePomodoro() {
    pausePomodoro();
    addXP(25);
    triggerConfetti();
    showNotification('Pomodoro completed! Great focus! 🎉', 'success');
    playSound('complete');
    
    // Show break suggestion
    setTimeout(() => {
        if (confirm('Take a 5-minute break?')) {
            setPomodoroTime(5);
            startPomodoro();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (display) {
        const minutes = String(Math.max(0, state.pomodoroMinutes || 0)).padStart(2, '0');
        const seconds = String(Math.max(0, state.pomodoroSeconds || 0)).padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;
    }

    // Update progress circle
    const progress = document.getElementById('timerProgress');
    if (progress) {
        // Get the original duration from the active preset button or use current minutes
        const activePreset = document.querySelector('.preset-btn.active');
        let originalMinutes = 25; // default
        
        if (activePreset) {
            originalMinutes = parseInt(activePreset.dataset.minutes) || 25;
        } else {
            // If no active preset, use the current minutes as the original
            originalMinutes = state.pomodoroMinutes || 25;
        }
        
        const totalSeconds = originalMinutes * 60;
        const currentSeconds = (state.pomodoroMinutes || 0) * 60 + (state.pomodoroSeconds || 0);
        const circumference = 2 * Math.PI * 140;
        
        // Calculate progress (0 to 1) - when timer is at full time, progress is 1 (full circle)
        const progressRatio = Math.max(0, Math.min(1, currentSeconds / totalSeconds));
        const offset = circumference - (progressRatio * circumference);
        
        // Ensure strokeDasharray is set
        if (!progress.style.strokeDasharray) {
            progress.style.strokeDasharray = circumference;
        }
        progress.style.strokeDashoffset = offset;
    }
}

function changeAmbientSound(soundType) {
    if (state.ambientSound) {
        state.ambientSound.pause();
        state.ambientSound = null;
    }

    // Note: In a real app, you'd load actual audio files
    // This is a placeholder for the sound system
    console.log('Ambient sound changed to:', soundType);
}

// ===== AI Features =====
function setupAIEventListeners() {
    // AI Modal
    const addTaskBtn = document.getElementById('addTaskBtn');
    const aiModal = document.getElementById('aiModal');
    const closeAIModal = document.getElementById('closeAIModal');

    // Long press on add button to open AI modal
    let longPressTimer;
    if (addTaskBtn) {
        addTaskBtn.addEventListener('mousedown', () => {
            longPressTimer = setTimeout(() => {
                aiModal.classList.remove('hidden');
            }, 500);
        });

        addTaskBtn.addEventListener('mouseup', () => {
            clearTimeout(longPressTimer);
        });

        addTaskBtn.addEventListener('mouseleave', () => {
            clearTimeout(longPressTimer);
        });
    }

    if (closeAIModal) {
        closeAIModal.addEventListener('click', () => {
            aiModal.classList.add('hidden');
        });
    }

    // AI Tabs
    document.querySelectorAll('.ai-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ai-panel').forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const panelId = `ai${tab.dataset.ai.charAt(0).toUpperCase() + tab.dataset.ai.slice(1)}Panel`;
            document.getElementById(panelId)?.classList.add('active');
        });
    });

    // Voice Recognition
    const startVoiceBtn = document.getElementById('startVoiceRecognition');
    const voiceStatus = document.getElementById('voiceStatus');
    
    if (startVoiceBtn) {
        startVoiceBtn.addEventListener('click', () => {
            startVoiceRecognition(startVoiceBtn, voiceStatus);
        });
    }

    // Text to Task
    document.getElementById('processText')?.addEventListener('click', () => {
        processTextToTasks();
    });

    // Task Breaker
    document.getElementById('breakTask')?.addEventListener('click', () => {
        breakTaskIntoSubtasks();
    });
}

function startVoiceRecognition(btn, statusEl) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        statusEl.textContent = 'Speech recognition not supported in this browser';
        return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    btn.classList.add('recording');
    statusEl.textContent = 'Listening...';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        statusEl.textContent = `Heard: "${transcript}"`;
        
        // Process the transcript as a task
        processVoiceTask(transcript);
        
        btn.classList.remove('recording');
    };

    recognition.onerror = (event) => {
        statusEl.textContent = `Error: ${event.error}`;
        btn.classList.remove('recording');
    };

    recognition.onend = () => {
        btn.classList.remove('recording');
    };

    recognition.start();
}

function processVoiceTask(transcript) {
    // Simple AI processing - extract task name and details
    const taskName = transcript.trim();
    const taskData = {
        name: taskName,
        description: 'Added via voice',
        priority: 'medium',
        category: '',
        completed: false,
        createdAt: new Date().toISOString()
    };

    createTask(taskData);
    showNotification('Task added from voice!', 'success');
}

function processTextToTasks() {
    const textInput = document.getElementById('aiTextInput');
    const text = textInput.value.trim();

    if (!text) {
        showNotification('Please enter some text', 'warning');
        return;
    }

    // Simple AI processing - split by common delimiters and create tasks
    const sentences = text.split(/[.!?]\s+|,\s+and\s+|and\s+/i);
    const tasks = [];

    sentences.forEach(sentence => {
        sentence = sentence.trim();
        if (sentence.length > 3) {
            // Extract time estimates (simple pattern matching)
            const timeMatch = sentence.match(/(\d+)\s*(?:min|minute|hour|hr)/i);
            const estimatedTime = timeMatch ? parseInt(timeMatch[1]) : null;

            // Extract due dates (simple pattern)
            const dateMatch = sentence.match(/(?:by|before|on)\s+(\w+\s+\d+|\d+\/\d+)/i);
            
            tasks.push({
                name: sentence.replace(/\d+\s*(?:min|minute|hour|hr)/gi, '').trim(),
                description: 'Generated from text',
                priority: sentence.match(/urgent|important|asap/i) ? 'high' : 'medium',
                estimatedTime: estimatedTime,
                completed: false,
                createdAt: new Date().toISOString()
            });
        }
    });

    tasks.forEach(taskData => createTask(taskData));
    textInput.value = '';
    showNotification(`Created ${tasks.length} task(s) from text!`, 'success');
}

function breakTaskIntoSubtasks() {
    const breakerInput = document.getElementById('breakerInput');
    const breakerResults = document.getElementById('breakerResults');
    const taskText = breakerInput.value.trim();

    if (!taskText) {
        showNotification('Please enter a task to break down', 'warning');
        return;
    }

    // Simple AI task breaking - generate common subtasks based on keywords
    const subtasks = generateSubtasks(taskText);
    
    breakerResults.innerHTML = `
        <h4>Suggested Subtasks:</h4>
        ${subtasks.map((subtask, index) => `
            <div class="breaker-step">
                <strong>${index + 1}.</strong> ${subtask}
            </div>
        `).join('')}
        <button class="btn-primary" style="margin-top: 1rem;" onclick="createTaskFromBreaker('${escapeHtml(taskText)}', ${JSON.stringify(subtasks).replace(/"/g, '&quot;')})">
            Create Task with Subtasks
        </button>
    `;
}

function generateSubtasks(taskText) {
    const lowerText = taskText.toLowerCase();
    const subtasks = [];

    // Generic subtask patterns
    if (lowerText.includes('project') || lowerText.includes('website') || lowerText.includes('app')) {
        subtasks.push('Research and planning');
        subtasks.push('Design mockups');
        subtasks.push('Development');
        subtasks.push('Testing');
        subtasks.push('Deployment');
    } else if (lowerText.includes('report') || lowerText.includes('document')) {
        subtasks.push('Gather information');
        subtasks.push('Create outline');
        subtasks.push('Write first draft');
        subtasks.push('Review and edit');
        subtasks.push('Finalize and submit');
    } else if (lowerText.includes('meeting') || lowerText.includes('presentation')) {
        subtasks.push('Prepare agenda');
        subtasks.push('Create materials');
        subtasks.push('Schedule meeting');
        subtasks.push('Conduct meeting');
        subtasks.push('Follow up');
    } else {
        // Default breakdown
        subtasks.push('Research and gather requirements');
        subtasks.push('Plan approach');
        subtasks.push('Execute main work');
        subtasks.push('Review and refine');
        subtasks.push('Complete and deliver');
    }

    return subtasks;
}

window.createTaskFromBreaker = function(taskName, subtasks) {
    const taskData = {
        name: taskName,
        description: 'Task broken down into steps',
        priority: 'medium',
        category: '',
        subtasks: subtasks.map((name, index) => ({
            name: name,
            completed: false,
            id: Date.now() + index
        })),
        completed: false,
        createdAt: new Date().toISOString()
    };

    createTask(taskData);
    document.getElementById('aiModal').classList.add('hidden');
    showNotification('Task created with subtasks!', 'success');
};

// ===== Productivity Systems =====
function addXP(amount) {
    state.userXP += amount;
    const xpNeeded = state.userLevel * 100;
    
    if (state.userXP >= xpNeeded) {
        state.userLevel++;
        state.userXP = state.userXP - xpNeeded;
        showNotification(`Level Up! You're now level ${state.userLevel}! 🎉`, 'success');
        triggerConfetti();
    }
    
    saveToLocalStorage();
    updateUI();
}

function checkStreak() {
    const today = new Date().toDateString();
    const lastActive = state.lastActiveDate ? new Date(state.lastActiveDate).toDateString() : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActive === today) {
        // Already active today
        return;
    } else if (lastActive === yesterdayStr) {
        // Continuing streak
        state.userStreak++;
    } else {
        // New streak
        state.userStreak = 1;
    }

    state.lastActiveDate = new Date().toISOString();
    saveToLocalStorage();
    updateUI();
}

function triggerConfetti() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

function loadMotivationalQuote() {
    const quotes = [
        "The way to get started is to quit talking and begin doing. - Walt Disney",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "It is during our darkest moments that we must focus to see the light. - Aristotle",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
        "Believe you can and you're halfway there. - Theodore Roosevelt"
    ];

    const quoteEl = document.getElementById('motivationalQuote');
    if (quoteEl) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteEl.textContent = `"${randomQuote}"`;
    }
}

// ===== Analytics =====
let heatmapChart = null;
let radialChart = null;
let completionChart = null;

function initializeCharts() {
    // Charts will be initialized when analytics view is opened
}

function updateAnalyticsView() {
    updateHeatmapChart();
    updateRadialChart();
    updateCompletionChart();
    updateProductivityStats();
}

function updateHeatmapChart() {
    const ctx = document.getElementById('heatmapChart');
    if (!ctx) return;

    // Generate weekly data
    const weekData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const tasksOnDay = state.tasks.filter(t => {
            const taskDate = t.completedAt ? new Date(t.completedAt) : new Date(t.createdAt);
            return taskDate.toDateString() === dateStr;
        });
        weekData.push(tasksOnDay.length);
    }

    if (heatmapChart) {
        heatmapChart.destroy();
    }

    heatmapChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
            datasets: [{
                label: 'Tasks Completed',
                data: weekData,
                backgroundColor: 'rgba(0, 243, 255, 0.5)',
                borderColor: 'rgba(0, 243, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function updateRadialChart() {
    const ctx = document.getElementById('radialChart');
    if (!ctx) return;

    const highPriority = state.tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = state.tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = state.tasks.filter(t => t.priority === 'low').length;

    if (radialChart) {
        radialChart.destroy();
    }

    radialChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High Priority', 'Medium Priority', 'Low Priority'],
            datasets: [{
                data: [highPriority, mediumPriority, lowPriority],
                backgroundColor: [
                    'rgba(255, 0, 0, 0.6)',
                    'rgba(255, 165, 0, 0.6)',
                    'rgba(0, 255, 0, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 0, 0, 1)',
                    'rgba(255, 165, 0, 1)',
                    'rgba(0, 255, 0, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

function updateCompletionChart() {
    const ctx = document.getElementById('completionChart');
    if (!ctx) return;

    const completed = state.tasks.filter(t => t.completed).length;
    const total = state.tasks.length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

    if (completionChart) {
        completionChart.destroy();
    }

    completionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: [
                    'rgba(0, 255, 136, 0.6)',
                    'rgba(255, 255, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(0, 255, 136, 1)',
                    'rgba(255, 255, 255, 0.5)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                title: {
                    display: true,
                    text: `Completion Rate: ${completionRate}%`,
                    color: 'rgba(255, 255, 255, 0.9)'
                }
            }
        }
    });
}

function updateProductivityStats() {
    const statsEl = document.getElementById('productivityStats');
    if (!statsEl) return;

    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    statsEl.innerHTML = `
        <div class="stat-card">
            <div class="stat-card-value">${totalTasks}</div>
            <div class="stat-card-label">Total Tasks</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-value">${activeTasks}</div>
            <div class="stat-card-label">Active Tasks</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-value">${completedTasks}</div>
            <div class="stat-card-label">Completed</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-value">${completionRate}%</div>
            <div class="stat-card-label">Completion Rate</div>
        </div>
    `;
}

// ===== Drag and Drop =====
function setupDragAndDrop() {
    // Task list drag and drop
    document.addEventListener('dragstart', (e) => {
        if (e.target.closest('.task-item') || e.target.closest('.kanban-task')) {
            const taskItem = e.target.closest('.task-item') || e.target.closest('.kanban-task');
            state.draggedTask = taskItem.dataset.taskId;
            taskItem.classList.add('dragging');
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.closest('.task-item') || e.target.closest('.kanban-task')) {
            const taskItem = e.target.closest('.task-item') || e.target.closest('.kanban-task');
            taskItem.classList.remove('dragging');
            state.draggedTask = null;
            state.draggedOver = null;
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        const taskItem = e.target.closest('.task-item');
        const kanbanColumn = e.target.closest('.kanban-column');
        const kanbanList = e.target.closest('.kanban-list');

        if (taskItem && state.draggedTask) {
            state.draggedOver = taskItem.dataset.taskId;
        } else if (kanbanColumn && state.draggedTask) {
            state.draggedOver = kanbanColumn.dataset.status;
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const taskItem = e.target.closest('.task-item');
        const kanbanColumn = e.target.closest('.kanban-column');
        const kanbanList = e.target.closest('.kanban-list');

        if (state.draggedTask) {
            const task = state.tasks.find(t => t.id === state.draggedTask);
            if (task) {
                if (kanbanColumn) {
                    // Dropped in Kanban column
                    task.status = kanbanColumn.dataset.status;
                    if (kanbanColumn.dataset.status === 'completed') {
                        task.completed = true;
                    } else {
                        task.completed = false;
                    }
                } else if (taskItem && taskItem.dataset.taskId !== state.draggedTask) {
                    // Reorder in task list
                    const targetIndex = state.tasks.findIndex(t => t.id === taskItem.dataset.taskId);
                    const draggedIndex = state.tasks.findIndex(t => t.id === state.draggedTask);
                    
                    if (targetIndex !== -1 && draggedIndex !== -1) {
                        const [removed] = state.tasks.splice(draggedIndex, 1);
                        state.tasks.splice(targetIndex, 0, removed);
                    }
                }

                saveToLocalStorage();
                updateUI();
            }
        }

        state.draggedTask = null;
        state.draggedOver = null;
    });
}

// ===== Settings =====
function setupSettingsListeners() {
    // Theme selection
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            changeTheme(theme);
        });
    });

    // Wallpaper
    document.getElementById('wallpaperInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.body.style.backgroundImage = `url(${event.target.result})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                localStorage.setItem('wallpaper', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('removeWallpaper')?.addEventListener('click', () => {
        document.body.style.backgroundImage = '';
        localStorage.removeItem('wallpaper');
    });

    // Notifications
    document.getElementById('notificationsEnabled')?.addEventListener('change', (e) => {
        if (e.target.checked) {
            requestNotificationPermission();
        }
    });

    // Cloud sync
    document.getElementById('enableCloudSync')?.addEventListener('click', () => {
        showNotification('Cloud sync feature coming soon!', 'info');
        // In a real app, this would connect to a backend service
    });
}

function changeTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    saveToLocalStorage();
    playSound('theme');
}

function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = state.isDarkMode ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    // Theme switching is handled by the theme system
    saveToLocalStorage();
}

// ===== LocalStorage =====
function saveToLocalStorage() {
    const data = {
        tasks: state.tasks,
        theme: state.currentTheme,
        isDarkMode: state.isDarkMode,
        userLevel: state.userLevel,
        userXP: state.userXP,
        userStreak: state.userStreak,
        lastActiveDate: state.lastActiveDate,
        pomodoroMinutes: state.pomodoroMinutes
    };
    localStorage.setItem('neonflow_data', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('neonflow_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.tasks = data.tasks || [];
            state.currentTheme = data.theme || 'cyberpunk';
            state.isDarkMode = data.isDarkMode !== undefined ? data.isDarkMode : true;
            state.userLevel = data.userLevel || 1;
            state.userXP = data.userXP || 0;
            state.userStreak = data.userStreak || 0;
            state.lastActiveDate = data.lastActiveDate;
            state.pomodoroMinutes = data.pomodoroMinutes || 25;

            // Apply theme
            document.documentElement.setAttribute('data-theme', state.currentTheme);
            
            // Apply wallpaper
            const wallpaper = localStorage.getItem('wallpaper');
            if (wallpaper) {
                document.body.style.backgroundImage = `url(${wallpaper})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
    }
}

// ===== Notifications =====
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // Browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('NeonFlow', {
            body: message,
            icon: '/favicon.ico'
        });
    }

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== Sound Effects =====
function playSound(type) {
    const soundEnabled = document.getElementById('soundEffectsEnabled')?.checked !== false;
    if (!soundEnabled) return;

    // In a real app, you'd load actual audio files
    // This is a placeholder for the sound system
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies = {
        'open': 440,
        'close': 330,
        'success': 523,
        'error': 220,
        'complete': 659,
        'delete': 196,
        'start': 440,
        'pause': 330,
        'theme': 523
    };

    oscillator.frequency.value = frequencies[type] || 440;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateUI() {
    updateTasksView();
    updateKanbanView();
    
    // Only update calendar if we're on calendar view
    if (state.currentView === 'calendar') {
        updateCalendarView();
    }
    
    // Update user stats
    const levelEl = document.getElementById('userLevel');
    const xpEl = document.getElementById('userXP');
    const streakEl = document.getElementById('userStreak');
    
    if (levelEl) levelEl.textContent = state.userLevel;
    if (xpEl) xpEl.textContent = state.userXP;
    if (streakEl) streakEl.textContent = state.userStreak;

    // Update category filter
    updateCategoryFilter();
}

// ===== WebSocket Collaboration (Placeholder) =====
function initializeWebSocket() {
    // In a real app, this would connect to a WebSocket server
    // const ws = new WebSocket('wss://your-server.com/ws');
    // ws.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     // Handle collaborative updates
    // };
    console.log('WebSocket collaboration would be initialized here');
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

