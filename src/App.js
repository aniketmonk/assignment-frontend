import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import ResizeHandle from "./ResizeHandle";
import styles from "./styles.module.css";

import { v4 as uuid4 } from "uuid";
const backend_url = "http://localhost:4000";

export default function App() {
  const [showFirstPanel, setShowFirstPanel] = useState(true);
  const [showLastPanel, setShowLastPanel] = useState(true);

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [currentEdit, setCurrentEdit] = useState(null);

  const [addCount, setAddCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);

  const handleAddTodo = async () => {
    if (currentEdit) {
      const response = await fetch(`${backend_url}/todos/${currentEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newTodo }),
      });
      if (!response.ok) {
        throw new Error("Failed to edit todo");
      }
      setUpdateCount(updateCount + 1);
      setTodos([
        ...todos.filter((fl) => fl.id !== currentEdit.id),
        { id: currentEdit.id, text: newTodo },
      ]);
      setCurrentEdit(null);
      setNewTodo("");
    } else if (newTodo.trim() !== "") {
      const res = await fetch(`${backend_url}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newTodo }),
      });
      if (res.ok) {
        const data = await res.json();
        setTodos([...todos, { id: data._id, text: newTodo }]);
        setAddCount(addCount + 1);
        setNewTodo("");
      }
    }
  };

  const handleDeleteTodo = async (id) => {
    const response = await fetch(`${backend_url}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleEditTodo = (id, text) => {
    setCurrentEdit({ id, text });
    setNewTodo(text);
  };

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${backend_url}/todos`);
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      setTodos(data?.map((item) => ({ id: item._id, text: item.text })));
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);
  return (
    <div className={styles.Container}>
      <div className={styles.BottomRow}>
        <PanelGroup autoSaveId="example" direction="vertical">
          <Panel className={styles.Panel} order={2}>
            <PanelGroup autoSaveId="example" direction="horizontal">
              <Panel className={styles.Panel} order={2}>
                <div className={styles.PanelContent}>
                  <div className={styles.LeftPanelContent}>
                    <div className={styles.Counter}>
                      <h2>Add Count: {addCount}</h2>
                    </div>
                    <div className={styles.Counter}>
                      <h2>Update Count: {updateCount}</h2>
                    </div>
                  </div>
                </div>
              </Panel>
              <ResizeHandle />
              <Panel className={styles.Panel} order={2}>
                <div className={styles.PanelContent}>
                  <div className={styles.AddTodoContainer}>
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Enter todo"
                      className={styles.InputTodo}
                    />
                    <button
                      onClick={handleAddTodo}
                      className={styles.AddButton}
                    >
                      {currentEdit ? "Edit Todo" : "Add Todo"}
                    </button>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <ResizeHandle />
          <Panel className={styles.Panel} order={2}>
            <div className={styles.PanelContent}>
              <div className={styles.d_flex}>
                <h2>Todos:</h2>
                <ul className={`${styles.TodoList} scroll`}>
                  {todos.map((todo) => (
                    <li key={todo.id} className={styles.TodoItem}>
                      <span className={styles.text_color}>{todo.text}</span>
                      <div className={styles.TodoActions}>
                        <button
                          onClick={() => handleEditTodo(todo.id, todo.text)}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteTodo(todo.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
