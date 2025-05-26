
import { useEffect, useState } from "react";
import { app } from "../firebase/config";
import { auth, login, register, logout, onAuthChange } from "../firebase/auth";
import * as XLSX from "xlsx";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    const unsub = onAuthChange(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      cargarGastos();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e) {
      alert("Error al iniciar sesión");
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, password);
    } catch (e) {
      alert("Error al registrarse");
    }
  };

  const handleLogout = () => logout();

  const agregarGasto = async () => {
    if (!descripcion || !monto) return;
    const nuevo = {
      descripcion,
      monto: parseFloat(monto),
      fecha: new Date().toISOString(),
      userId: user.uid,
    };
    await addDoc(collection(db, "gastos"), nuevo);
    setDescripcion("");
    setMonto("");
    cargarGastos();
  };

  const cargarGastos = async () => {
    const q = query(collection(db, "gastos"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const datos = snapshot.docs.map(doc => doc.data());
    setGastos(datos);
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(gastos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, "reporte_gastos.xlsx");
  };

  const totalPorPeriodo = (meses) => {
    const hoy = new Date();
    const fechaLimite = new Date(hoy);
    fechaLimite.setMonth(hoy.getMonth() - meses);
    return gastos
      .filter(g => new Date(g.fecha) >= fechaLimite)
      .reduce((acc, g) => acc + g.monto, 0);
  };

  if (!user) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Login o Registro</h1>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Iniciar Sesión</button>
        <button onClick={handleRegister}>Registrarse</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Asistente Contable</h1>
      <p>Bienvenido, {user.email} <button onClick={handleLogout}>Cerrar sesión</button></p>
      <div>
        <h2>Registrar Gasto</h2>
        <input type="text" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <input type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
        <button onClick={agregarGasto}>Guardar</button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h2>Historial</h2>
        <ul>
          {gastos.map((g, i) => (
            <li key={i}>{new Date(g.fecha).toLocaleDateString("es-CL")} - {g.descripcion} - ${g.monto}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Proyecciones</h3>
        <p>Mensual: ${totalPorPeriodo(1)}</p>
        <p>Semestral: ${totalPorPeriodo(6)}</p>
        <p>Anual: ${totalPorPeriodo(12)}</p>
        <button onClick={exportarExcel}>Exportar a Excel</button>
      </div>
    </div>
  );
}
