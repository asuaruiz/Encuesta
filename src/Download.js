import React, { useState } from 'react';
import axios from 'axios';
import JSZip from 'jszip';

function Download() {
  const [skus, setSkus] = useState('');
  const [selectedSize, setSelectedSize] = useState('185x185'); // Tamaño predeterminado
  const [downloadLink, setDownloadLink] = useState('');

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleDownloadImages = async (e) => {
    e.preventDefault(); // Prevenir el envío del formulario

    const skuArray = skus.split(',').map(sku => sku.trim());

    const zip = new JSZip();

    for (const sku of skuArray) {
      const imageUrl = `https://www.dimerc.cl/catalog/thumbnail/get/size/${selectedSize}/sku/${sku}.jpg`;

      try {
        const response = await axios.get(imageUrl, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'image/jpeg' });
        zip.file(`${sku}.jpg`, blob);
      } catch (error) {
        console.error(`Error downloading image for SKU ${sku}: ${error.message}`);
      }
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
      const downloadUrl = window.URL.createObjectURL(content);
      setDownloadLink(downloadUrl);
    });
  };

  return (
    <div className="container-fluid">
      <div className="row d-flex">
        <div className="col align-middle">
          <div className="px-2 py-2">
            <img src="https://img.freepik.com/free-vector/happy-freelancer-with-computer-home-young-man-sitting-armchair-using-laptop-chatting-online-smiling-vector-illustration-distance-work-online-learning-freelance_74855-8401.jpg?w=900&t=st=1667037491~exp=1667038091~hmac=7c71ea8afc8f3cc8065c5ccc05d105e3c8a7b76f0133016cb210a7882dc19611" className="img-fluid" alt="..." />
          </div>
        </div>
        <div className="col">
          <div className="px-5 py-5 mt-5">
            <div className="px-2 py-2">
              <h2>Soluciones de automatización</h2>
              <p>Descarga tus imágenes</p>
            </div>
            <div className="px-2 py-2">
              <form onSubmit={handleDownloadImages}>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="col-6">
                      <p className="mb-2">Selecciona el tamaño de la imagen:</p>
                      <div className="btn-group" role="group">
                        <button type="button" className={`btn ${selectedSize === '185x185' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSizeChange('185x185')}>185x185</button>
                        <button type="button" className={`btn ${selectedSize === '250x250' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSizeChange('250x250')}>250x250</button>
                        <button type="button" className={`btn ${selectedSize === '500x500' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSizeChange('500x500')}>500x500</button>
                        <button type="button" className={`btn ${selectedSize === '1000x1000' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSizeChange('1000x1000')}>1000x1000</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="col-6">
                      <label htmlFor="your-message" className="form-label">Agrega los SKU separados por coma</label>
                      <textarea className="form-control" id="your-message" name="your-message" value={skus} onChange={(e) => setSkus(e.target.value)} rows="5" required></textarea>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="col-6">
                      <button type="submit" className="btn btn-dark w-100 fw-bold">Descargar</button>
                    </div>
                  </div>
                <div className="col-12">
                    <div className="col-6">
                        {downloadLink && (
                            <div className="row">
                                <div className="col">
                                    <p>Descarga ZIP:</p>
                                    <a href={downloadLink} download="images.zip" className="btn btn-primary">Descargar ZIP</a>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;


