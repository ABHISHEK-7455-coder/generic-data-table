import { useEffect, useState, type FormEvent } from "react";
import { DataTable } from "./component/datatable";
import type { User } from "./data/users";

const emptyForm = {
  name: "",
  email: "",
  age: "",
};

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/users");
      const data = (await response.json()) as User[];
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const payload = {
        name: form.name,
        email: form.email,
        age: Number(form.age),
      };

      const url = editingId ? `http://localhost:5000/users/${editingId}` : "http://localhost:5000/users";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Request failed");
      }

      setForm(emptyForm);
      setEditingId(null);
      setMessage(editingId ? "User updated successfully." : "User created successfully.");
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  function handleEdit(user: User) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, age: String(user.age) });
  }

  async function handleDelete(user: User) {
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Delete failed");
      }

      setMessage("User deleted successfully.");
      await loadUsers();
      if (editingId === user.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Generic Data Table</h1>
      <p>Connects to your Express backend and MongoDB Atlas through the new CRUD API.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: "24rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
          required
        />
        <button type="submit">{editingId ? "Update User" : "Add User"}</button>
        {editingId ? (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            Cancel
          </button>
        ) : null}
      </form>

      {message ? <p>{message}</p> : null}

      {loading ? <p>Loading users...</p> : null}

      <DataTable<User>
        data={users}
        columns={[
          {
            key: "id",
            header: "ID",
          },
          {
            key: "name",
            header: "Name",
          },
          {
            key: "email",
            header: "Email",
          },
          {
            key: "age",
            header: "Age",
          },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;