// Simple ToDo app with localStorage + inline editing
const STORAGE_KEY = 'todo_app_v1';
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const listEl = document.getElementById('todo-list');
const countEl = document.getElementById('count');
const filters = document.querySelectorAll('.filter');
const clearCompletedBtn = document.getElementById('clear-completed');
const toggleAllBtn = document.getElementById('toggle-all');

let todos = [];
let filter = 'all'; // all | active | completed

// Load from localStorage
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse todos', e);
    todos = [];
  }
}

// Save to localStorage
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Place caret at end of a contentEditable element
function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection !== 'undefined'
      && typeof document.createRange !== 'undefined') {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// Render the list based on current filter
function render() {
  listEl.innerHTML = '';
  const visible = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  visible.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.addEventListener('change', () => toggleComplete(todo.id));

    const span = document.createElement('div');
    span.className = 'text';
    span.textContent = todo.text;
    span.tabIndex = 0;

    // Inline edit on double click (also on Enter while focused)
    span.addEventListener('dblclick', () => startInlineEdit(todo.id, span));
    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        startInlineEdit(todo.id, span);
      }
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'edit';
    editBtn.title = 'Modifier';
    editBtn.innerText = '✎';
    editBtn.addEventListener('click', () => startInlineEdit(todo.id, span));

    const delBtn = document.createElement('button');
    delBtn.title = 'Supprimer';
    delBtn.innerText = '🗑';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    listEl.appendChild(li);
  });

  const remaining = todos.filter(t => !t.completed).length;
  countEl.textContent = `${remaining} tâche(s) restante(s) • ${todos.length} au total`;
  // Update active filter UI
  filters.forEach(f => f.classList.toggle('active', f.dataset.filter === filter));
}

// Start inline edit for a todo; span is the element to edit
function startInlineEdit(id, span) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  if (span.isContentEditable) return;

  const original = todo.text;
  span.contentEditable = 'true';
  span.classList.add('editing');
  span.setAttribute('aria-label', 'Édition de la tâche');
  placeCaretAtEnd(span);

  function commit() {
    const newText = span.textContent.trim();
    cleanup();
    if (newText === original) return;
    if (!newText) {
      if (confirm('Le texte est vide — supprimer la tâche ?')) {
        deleteTodo(id);
      } else {
        todo.text = original;
        save();
        render();
      }
      return;
    }
    todo.text = newText;
    save();
    render();
  }

  function cancel() {
    cleanup();
    todo.text = original;
    render();
  }

  function cleanup() {
    span.contentEditable = 'false';
    span.classList.remove('editing');
    span.removeEventListener('blur', onBlur);
    span.removeEventListener('keydown', onKeyDown);
  }

  function onBlur() {
    commit();
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  }

  span.addEventListener('blur', onBlur);
  span.addEventListener('keydown', onKeyDown);
}

// Add a new todo
function addTodo(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return;
  const todo = { id: Date.now().toString(), text: trimmed, completed: false, createdAt: Date.now() };
  todos.unshift(todo); // newest first
  save();
  render();
}

// Toggle completed state
function toggleComplete(id) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  save();
  render();
}

// Delete a todo
function deleteTodo(id) {
  todos = todos.filter(x => x.id !== id);
  save();
  render();
}

// Clear completed
function clearCompleted() {
  if (!todos.some(t => t.completed)) return;
  if (!confirm('Supprimer toutes les tâches terminées ?')) return;
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

// Toggle all (if any active -> complete all, otherwise uncomplete all)
function toggleAll() {
  const anyActive = todos.some(t => !t.completed);
  todos.forEach(t => t.completed = anyActive);
  save();
  render();
}

// Event bindings
form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = '';
  input.focus();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') input.value = '';
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);
toggleAllBtn.addEventListener('click', toggleAll);

// Initialization
load();
render();
