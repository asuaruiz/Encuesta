import React, { useState } from 'react';
import Papa from 'papaparse';

function CSVProcessor() {
    const [responses, setResponses] = useState([]);
    const [responseSummary, setResponseSummary] = useState({});
  
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
  
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const data = results.data;
  
          // Inicializa un objeto para contar las respuestas de forma dinámica
          const dynamicResponseSummary = {};
  
          let totalRespuestas = 0;
  
          data.forEach((row) => {
            const respuestaRaw = row["pregunta1"];
            if (typeof respuestaRaw === "string") {
              const respuestasList = respuestaRaw.split(", ");
              totalRespuestas += respuestasList.length;
  
              respuestasList.forEach((respuesta) => {
                const respuestaLimpia = respuesta.trim();
  
                // Si la respuesta ya existe en el objeto dinámico, aumenta su conteo
                if (respuestaLimpia in dynamicResponseSummary) {
                  dynamicResponseSummary[respuestaLimpia].count++;
                } else {
                  // Si no existe, inicializa su conteo en 1
                  dynamicResponseSummary[respuestaLimpia] = { count: 1 };
                }
              });
            }
          });
  
          // Calcula los porcentajes
          for (const [respuesta, info] of Object.entries(dynamicResponseSummary)) {
            info.percentage = ((info.count / totalRespuestas) * 100).toFixed(2);
          }
  
          setResponses(data);
          setResponseSummary(dynamicResponseSummary);
        },
      });
    }
  
    return (
      <div>
        <input type="file" onChange={handleFileUpload} accept=".csv" />
        {/* <div>
          <h2>Resultados:</h2>
          <pre>{JSON.stringify(responses, null, 2)}</pre>
        </div> */}
        <div>
          <h2>Resumen de respuestas:</h2>
          <ul>
            {Object.entries(responseSummary).map(([respuesta, info]) => (
              <li key={respuesta}>
                {respuesta}: {info.percentage}%
                {/* {respuesta}: {info.count} ({info.percentage}%) */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  export default CSVProcessor;
  