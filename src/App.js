
import { useState } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [gastos, setGastos] = useState([]);

  const agregarGasto = () => {
    if (!descripcion || !monto) return;
    const nuevo = {
      descripcion,
      monto: parseFloat(monto),
      fecha: new Date().toLocaleDateString("es-CL")
    };
    setGastos([...gastos, nuevo]);
    setDescripcion("");
    setMonto("");
  };

  const totalPorPeriodo = (meses) => {
    const hoy = new Date();
    const fechaLimite = new Date(hoy);
    fechaLimite.setMonth(hoy.getMonth() - meses);
    return gastos
      .filter(g => new Date(g.fecha) >= fechaLimite)
      .reduce((acc, g) => acc + g.monto, 0);
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(gastos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, "reporte_gastos.xlsx");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Asistente Contable</h1>

      <div style={{ marginTop: "20px" }}>
        <h2>Registrar Gasto</h2>
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          style={{ display: "block", marginBottom: "8px", padding: "8px", width: "100%" }}
        />
        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          style={{ display: "block", marginBottom: "8px", padding: "8px", width: "100%" }}
        />
        <button onClick={agregarGasto} style={{ padding: "10px 20px" }}>Guardar Gasto</button>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Historial de Gastos</h2>
        <ul>
          {gastos.map((g, i) => (
            <li key={i}>{g.fecha} - {g.descripcion} - ${g.monto}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Proyecciones</h2>
        <p>Mensual: ${totalPorPeriodo(1)}</p>
        <p>Semestral: ${totalPorPeriodo(6)}</p>
        <p>Anual: ${totalPorPeriodo(12)}</p>
      </div>

      <button onClick={exportarExcel} style={{ marginTop: "20px", padding: "10px 20px" }}>
        Exportar a Excel
      </button>
    </div>
  );
}
