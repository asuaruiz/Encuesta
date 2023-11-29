import React, { useState } from 'react';
import Papa from 'papaparse';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
ChartJS.register(ArcElement, Tooltip, Legend);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function CSVProcessor() {
  const [responses, setResponses] = useState([]);
  const [responseSummary, setResponseSummary] = useState({});
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columnNames, setColumnNames] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [customResponses, setCustomResponses] = useState([]);
  const [showRandomResponses, setShowRandomResponses] = useState(5);
  const [chartHistory, setChartHistory] = useState([]); // Array para almacenar datos de gráficos anteriores
  const [chartResponseSummaries, setChartResponseSummaries] = useState([]); // Estado para resumen de respuestas por gráfico

  // Función para transformar los datos
  const transformData = (data) => {
    return data.map((row) => {
      const selectedResponse = row[selectedColumn];

      if (selectedResponse) {
        if (
          selectedResponse.toLowerCase().includes('despacho') ||
          selectedResponse.toLowerCase().includes('envío')
        ) {
          // Si contiene 'despacho' o 'envío', agrégalo a una nueva columna
          row['NuevaColumna'] = 'Form_Submissions';
        }
      }
      return row;
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const data = results.data;
        const names = results.meta.fields;

        setColumnNames(names);

        // Transforma los datos antes de setearlos
        const transformedData = transformData(data);

        setResponses(transformedData);
        setCustomResponses(transformedData.map((row) => row.pregunta1_otro));
      },
    });
  };

  const generateChart = (columnName) => { // Pasa el nombre de la columna como argumento
    const selectedColumnData = responses.map((row) => row[columnName]); // Utiliza el nombre de la columna
    const dynamicResponseSummary = {};
    let totalRespuestas = 0;

    selectedColumnData.forEach((respuestaRaw) => {
      if (typeof respuestaRaw === "string") {
        const respuestasList = respuestaRaw.split(", ");
        totalRespuestas += respuestasList.length;

        respuestasList.forEach((respuesta) => {
          const respuestaLimpia = respuesta.trim();

          if (respuestaLimpia in dynamicResponseSummary) {
            dynamicResponseSummary[respuestaLimpia].count++;
          } else {
            dynamicResponseSummary[respuestaLimpia] = { count: 1 };
          }
        });
      }
    });

    for (const [respuesta, info] of Object.entries(dynamicResponseSummary)) {
      info.percentage = ((info.count / totalRespuestas) * 100).toFixed(2);
    }

    // Ordenar el objeto dynamicResponseSummary por la cantidad de respuestas de mayor a menor
    const sortedResponseSummary = Object.entries(dynamicResponseSummary)
      .sort((a, b) => b[1].count - a[1].count)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    // Actualiza el resumen de respuestas para este gráfico específico
    setResponseSummary(sortedResponseSummary);

    // Actualiza el estado del gráfico y el nombre de la columna
    const chartData = {
      labels: Object.keys(dynamicResponseSummary),
      datasets: [
        {
          data: Object.values(dynamicResponseSummary).map((info) => info.percentage),
          backgroundColor: [
            'red', 'blue', 'green', 'orange', 'purple', 'pink',
          ],
        },
      ],
    };

    // Agrega el nuevo gráfico al historial de gráficos con el nombre de la columna
    setChartHistory([...chartHistory, { data: chartData, columnName: columnName }]);

    // Agrega el resumen de respuestas para este gráfico específico al estado
    setChartResponseSummaries([...chartResponseSummaries, { columnName: columnName, summary: sortedResponseSummary }]);

    setChartData(chartData);
  };

  // Función para actualizar las respuestas personalizadas cuando se selecciona una pregunta
  const updateCustomResponses = (selectedQuestion) => {
    if (selectedQuestion === 'pregunta1') {
      setCustomResponses(responses.map((row) => row.pregunta1_otro));
    } else {
      setCustomResponses([]);
    }
  };

  return (
    <div className='row center-widht'>
      <input type="file" onChange={handleFileUpload} accept=".csv" />
      <div className=''>
        <h2>Selecciona la columna:</h2>
        {columnNames.map((columnName) => (
          <button className='btn btn-info extra-pad'
            key={columnName}
            onClick={() => {
              setSelectedColumn(columnName);
              updateCustomResponses(columnName);
              generateChart(columnName);
            }}
          >
            {columnName}
          </button>
        ))}
      </div>
      {chartHistory.length > 0 && (
        <div className='row'>
          <h2>Historial de Gráficos:</h2>
          {chartHistory.map((chartInfo, index) => (
            <div className='col-md-4' key={index}>
             <div className='small-container'>
             <h3>{`Gráfico ${index + 1}: ${chartInfo.columnName}`}</h3>
              <Pie data={chartInfo.data} />
             </div>
              <div>
                <h2>Resumen de respuestas:</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Respuesta</th>
                      <th>Cantidad</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(chartResponseSummaries[index].summary).map(([respuesta, info]) => (
                      <tr key={respuesta}>
                        <td>{respuesta}</td>
                        <td>{info.count}</td>
                        <td>{info.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mostrar respuestas personalizadas de pregunta1_otro si se selecciona pregunta1 */}
      {selectedColumn === 'pregunta1' && (
        <div className='col-4'>
          <h2>Respuestas personalizadas de pregunta1_otro (aleatorias):</h2>
          <button onClick={() => setShowRandomResponses(5)}>Mostrar 5 respuestas</button>
          <button onClick={() => setShowRandomResponses(10)}>Mostrar 10 respuestas</button>
          <ul>
            {shuffleArray(customResponses) // Aleatoriza las respuestas
              .filter((respuesta) => respuesta.trim() !== '') // Filtra respuestas vacías
              .slice(0, showRandomResponses) // Muestra solo el número seleccionado
              .map((respuesta, index) => (
                <li key={index}>{respuesta}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Mostrar el resumen de las respuestas debajo de los gráficos */}
      <div className='col-4'></div>
    </div>
  );
}

export default CSVProcessor;
