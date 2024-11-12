import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Trash, Pencil, X, User } from 'lucide-react';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const response = await axios.post('http://localhost:5000/api/todos', {
        text: newTodo,
        notes: '',
        assignee: newAssignee.trim() || 'Unassigned'
      });
      setTodos([response.data, ...todos]);
      setNewTodo('');
      setNewAssignee('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${id}`, {
        completed: !completed
      });
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const updateNotes = async () => {
    if (!selectedTodo) return;
    
    try {
      const response = await axios.put(`http://localhost:5000/api/todos/${selectedTodo._id}`, {
        notes: notes,
        completed: selectedTodo.completed,
        assignee: selectedTodo.assignee
      });
      
      setTodos(todos.map(todo => 
        todo._id === selectedTodo._id ? response.data : todo
      ));
      closeModal();
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const openModal = (todo) => {
    setSelectedTodo(todo);
    setNotes(todo.notes || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTodo(null);
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-2xl sm:mx-auto w-full px-4">
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-center mb-8">Todo App with Notes</h1>
          
          <form onSubmit={addTodo} className="flex flex-col gap-2 mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                placeholder="Assign to..."
                className="w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg group"
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTodo(todo._id, todo.completed)}
                    className={`${
                      todo.completed ? 'text-green-500' : 'text-gray-400'
                    } hover:text-green-600 transition-colors`}
                  >
                    <CheckCircle className="h-6 w-6" />
                  </button>
                  <div className="flex flex-col">
                    <span className={`${
                      todo.completed ? 'line-through text-gray-400' : ''
                    }`}>
                      {todo.text}
                    </span>
                    {todo.notes && (
                      <span className="text-sm text-gray-500 mt-1">
                        {todo.notes.length > 50 
                          ? todo.notes.substring(0, 50) + '...' 
                          : todo.notes}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm">{todo.assignee}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openModal(todo)}
                      className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Notes for: {selectedTodo?.text}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="w-full min-h-[200px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateNotes}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;