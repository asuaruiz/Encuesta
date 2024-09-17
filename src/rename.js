import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Modal, Button, Table } from 'react-bootstrap';

const Rename = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [renamedFiles, setRenamedFiles] = useState([]);
  const [unmappedFiles, setUnmappedFiles] = useState([]);
  const [skuMap, setSkuMap] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleZipChange = (e) => {
    setZipFile(e.target.files[0]);
  };

  const handleDownloadExample = () => {
    const exampleData = [
      { 'SKU': '556590', 'SKU_Proveedor': 'K62316' },
      { 'SKU': '556591', 'SKU_Proveedor': 'K62183WW' },
      { 'SKU': '556592', 'SKU_Proveedor': 'K34020WW' }
    ];

    const wb = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(exampleData);
    XLSX.utils.book_append_sheet(wb, sheet, 'Ejemplo_SKU');
    XLSX.writeFile(wb, 'ejemplo_sku.xlsx');
  };

  const handleProcessFiles = async () => {
    if (!excelFile || !zipFile) {
      alert('Por favor, sube ambos archivos (Excel y ZIP).');
      return;
    }

    // Leer el archivo Excel
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonExcelData = XLSX.utils.sheet_to_json(worksheet);

      // Crear un mapa de SKU del proveedor -> SKU
      const skuMapping = {};
      jsonExcelData.forEach((row) => {
        const skuProveedor = row['SKU_Proveedor'].trim().toUpperCase(); // Normalizar
        skuMapping[skuProveedor] = row['SKU'];
      });

      setSkuMap(skuMapping);

      // Leer el archivo ZIP
      const zip = new JSZip();
      const zipData = await JSZip.loadAsync(zipFile);

      const renamed = [];
      const unmapped = [];
      const supportedExtensions = ['jpg', 'png', 'webp', 'pdf', 'html'];

      for (const relativePath in zipData.files) {
        const file = zipData.files[relativePath];
        const cleanedPath = relativePath.replace('renombrar/', '');
        const extension = cleanedPath.split('.').pop().toLowerCase();

        // Definir baseName antes de utilizarlo
        let baseName = cleanedPath.split('_')[0];  // Tomar la parte antes del guion bajo (SKU Proveedor)
        baseName = baseName.split('.')[0].trim().toUpperCase(); // Normalizar a mayúsculas y eliminar espacios

        if (supportedExtensions.includes(extension)) {
          if (skuMapping[baseName]) {
            renamed.push({
              original: cleanedPath,
              renamed: skuMapping[baseName],
              skuProveedor: baseName
            });
            console.log(`Archivo renombrado: ${cleanedPath}`);
          } else {
            unmapped.push({
              original: cleanedPath,
              skuProveedor: baseName
            });
            console.log(`Archivo sin mapeo: ${cleanedPath}`);
          }
        } else {
          unmapped.push({
            original: cleanedPath,
            skuProveedor: baseName
          });
          console.log(`Extensión no soportada: ${cleanedPath}`);
        }
      }

      setRenamedFiles(renamed);
      setUnmappedFiles(unmapped);
      setShowModal(true);
    };

    reader.readAsArrayBuffer(excelFile);
  };

  const handleDownloadExcel = () => {
    const wb = XLSX.utils.book_new();

    // Crear hoja para archivos renombrados
    const renamedSheet = XLSX.utils.json_to_sheet(
      renamedFiles.map(file => ({
        'Archivo Original': file.original,
        'Archivo Renombrado': file.renamed,
        'SKU Proveedor': file.skuProveedor
      }))
    );
    XLSX.utils.book_append_sheet(wb, renamedSheet, 'Archivos Renombrados');

    // Crear hoja para archivos sin mapeo
    const unmappedSheet = XLSX.utils.json_to_sheet(
      unmappedFiles.map(file => ({
        'Archivo Original': file.original,
        'SKU Proveedor': file.skuProveedor
      }))
    );
    XLSX.utils.book_append_sheet(wb, unmappedSheet, 'Archivos Sin Mapeo');

    XLSX.writeFile(wb, 'resultado_renombrado.xlsx');
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    const zipData = await JSZip.loadAsync(zipFile);

    const newZip = new JSZip();
    const supportedExtensions = ['jpg', 'png', 'webp', 'pdf', 'html'];

    for (const relativePath in zipData.files) {
      const file = zipData.files[relativePath];
      const cleanedPath = relativePath.replace('renombrar/', '');
      const extension = cleanedPath.split('.').pop().toLowerCase();

      let baseName = cleanedPath.split('_')[0];
      baseName = baseName.split('.')[0].trim().toUpperCase();

      if (supportedExtensions.includes(extension)) {
        if (skuMap[baseName]) {
          const extraPart = cleanedPath.includes('_') ? cleanedPath.split('_')[1].split('.')[0] : '';
          const newFileName = extraPart ? `${skuMap[baseName]}_${extraPart}.${extension}` : `${skuMap[baseName]}.${extension}`;
          const content = await file.async('blob');
          newZip.file(newFileName, content);
          console.log(`Agregando al ZIP: ${newFileName}`);
        } else {
          console.log(`Archivo no mapeado en ZIP: ${cleanedPath}`);
        }
      } else {
        console.log(`Extensión no soportada en ZIP: ${cleanedPath}`);
      }
    }

    const content = await newZip.generateAsync({ type: 'blob' });
    saveAs(content, 'renamed_files.zip');
    setShowModal(false);
  };

  return (
    <div className="container">
      <h2>Renombrar Imágenes y Archivos</h2>
      <p>Sube el archivo Excel y la carpeta comprimida en ZIP para renombrar las imágenes y archivos.</p>
      
      {/* Botón para descargar archivo de ejemplo */}
      <div className="row mb-3">
        <div className="col-12">
          <button className="btn btn-secondary" onClick={handleDownloadExample}>Descargar Archivo de Ejemplo</button>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <input type="file" accept=".xlsx" onChange={handleExcelChange} className="form-control" />
        </div>
        <div className="col-6">
          <input type="file" accept=".zip" onChange={handleZipChange} className="form-control" />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <button className="btn btn-primary w-100" onClick={handleProcessFiles}>Procesar Archivos</button>
        </div>
      </div>

      {/* Modal para confirmar la descarga */}
     {/* Modal para confirmar la descarga */}
<Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Archivos Procesados</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
    <h5>Archivos que serán renombrados:</h5>
    <Table striped bordered hover responsive style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <th style={{ width: '50%' }}>Archivo Original</th>
          <th style={{ width: '25%' }}>Archivo Renombrado</th>
          <th style={{ width: '25%' }}>SKU Proveedor</th>
        </tr>
      </thead>
      <tbody>
        {renamedFiles.length > 0 ? (
          renamedFiles.map((file, index) => (
            <tr key={index}>
              <td style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{file.original}</td>
              <td style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{file.renamed}</td>
              <td style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{file.skuProveedor}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No se encontró ningún archivo para renombrar.</td>
          </tr>
        )}
      </tbody>
    </Table>

    <h5>Archivos sin SKU mapeado o extensión no soportada:</h5>
    <Table striped bordered hover responsive style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <th style={{ width: '50%' }}>Archivo Original</th>
          <th style={{ width: '50%' }}>SKU Proveedor</th>
        </tr>
      </thead>
      <tbody>
        {unmappedFiles.length > 0 ? (
          unmappedFiles.map((file, index) => (
            <tr key={index}>
              <td style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{file.original}</td>
              <td style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{file.skuProveedor}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="2">No se encontraron archivos no soportados o sin mapeo.</td>
          </tr>
        )}
      </tbody>
    </Table>
  </Modal.Body>
  <Modal.Footer style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', zIndex: 1 }}>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleDownloadExcel}>
      Descargar Informe en Excel
    </Button>
    <Button variant="primary" onClick={handleDownload}>
      Descargar ZIP
    </Button>
  </Modal.Footer>
</Modal>


    </div>
  );
};

export default Rename;

