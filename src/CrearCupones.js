import React, { useState } from 'react';
import axios from 'axios';

function CrearCupones() {
  const [couponNames, setCouponNames] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleCreateCoupons = async () => {
    if (!couponNames) {
      setStatusMessage('Por favor, ingresa los nombres de los cupones.');
      return;
    }

    const couponNamesArray = couponNames.split(',').map((name) => name.trim());

    const cuponData = couponNamesArray.map((name) => ({
      quantity: 1,
      couponConfiguration: {
        utmSource: 'fb',
        utmCampaign: 'bf',
        couponCode: name,
        isArchived: false,
        maxItemsPerClient: 10,
        expirationIntervalPerUse: '00:00:00',
        maxUsage: 1,
      },
    }));

    try {
      for (const cupon of cuponData) {
        const apiUrl = 'http://localhost:8080/http://dimeiggsschl.myvtex.com/api/rnb/pvt/multiple-coupons';

        const response = await axios.post(apiUrl, cupon, {
          headers: {
            'X-VTEX-API-AppKey': 'vtexappkey-dimeiggsschl-CBEPEC',
            'X-VTEX-API-AppToken': 'PJAYZCCHFUZHFVVSCMAUTFGTAYNWDPPNXBTAZWPASGLHWIWZRJCOFLRSTCMNSBLLVCQABLZVSRTKTXZYAVCMLPBCRZXRNTMNFPDTEBXCCESOZWTLYDCFBLJCSBLHIIOZ',
          },
        });

        if (response.status === 200) {
          setStatusMessage(`Cupón ${cupon.couponConfiguration.couponCode} creado con éxito`);
        } else {
          setStatusMessage(`Error al crear el cupón ${cupon.couponConfiguration.couponCode}: ${response.data}`);
        }
      }
    } catch (error) {
      setStatusMessage(`Error al crear los cupones: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Crear Cupones</h2>
      <textarea
        rows="5"
        cols="50"
        placeholder="Ingresa los nombres de los cupones separados por comas"
        value={couponNames}
        onChange={(e) => setCouponNames(e.target.value)}
      />
      <button onClick={handleCreateCoupons}>Crear Cupones</button>
      <p>{statusMessage}</p>
    </div>
  );
}

export default CrearCupones;
