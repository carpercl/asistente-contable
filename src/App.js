import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Asistente Contable</h1>

      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-xl font-semibold">Registrar Gasto</h2>
          <Input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <Input placeholder="Monto (CLP)" type="number" value={monto} onChange={e => setMonto(e.target.value)} />
          <Button onClick={agregarGasto}>Agregar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-xl font-semibold">Historial de Gastos</h2>
          <ul>
            {gastos.map((g, i) => (
              <li key={i}>{g.fecha} - {g.descripcion} - ${g.monto}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-xl font-semibold">Proyecciones</h2>
          <p>Mensual: ${totalPorPeriodo(1)}</p>
          <p>Semestral: ${totalPorPeriodo(6)}</p>
          <p>Anual: ${totalPorPeriodo(12)}</p>
        </CardContent>
      </Card>

      <Button onClick={exportarExcel}>Exportar a Excel</Button>
    </div>
  );
}
