class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Add task events
        document.getElementById('add-btn').addEventListener('click', () => this.addTask());
        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });
    }

    addTask() {
        const input = document.getElementById('task-input');
        const taskText = input.value.trim();

        if (taskText === '') {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        input.value = '';
        this.saveToStorage();
        this.render();
        this.showNotification('Task added successfully!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('slide-out');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveToStorage();
                this.render();
            }, 300);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }

        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveToStorage();
        this.render();
        this.showNotification(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}!`, 'success');
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        const filteredTasks = this.getFilteredTasks();

        // Update stats
        this.updateStats();

        // Clear current list
        todoList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.classList.add('show');
            todoList.style.display = 'none';
        } else {
            emptyState.classList.remove('show');
            todoList.style.display = 'block';

            filteredTasks.forEach(task => {
                const li = this.createTaskElement(task);
                todoList.appendChild(li);
            });
        }
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''} fade-in`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="todo-text">${this.escapeHtml(task.text)}</span>
            <button class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        // Bind events
        const checkbox = li.querySelector('.todo-checkbox');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        return li;
    }

    updateStats() {
        const totalCount = this.tasks.length;
        const completedCount = this.tasks.filter(t => t.completed).length;

        document.getElementById('total-count').textContent = totalCount;
        document.getElementById('completed-count').textContent = completedCount;
    }

    saveToStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('todoTasks');
            if (stored) {
                this.tasks = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
            this.tasks = [];
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #10b981;' : ''}
            ${type === 'error' ? 'background: #ef4444;' : ''}
            ${type === 'info' ? 'background: #3b82f6;' : ''}
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add some CSS for the notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);