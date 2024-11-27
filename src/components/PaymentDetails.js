import React, { useEffect, useState } from 'react';
import { fetchPaymentDetails } from '../api/paymentHistoryApi';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentDetails = () => {
  const { paymentId } = useParams();
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const loadPaymentDetails = async () => {
      try {
        const response = await fetchPaymentDetails(paymentId);
        setPayment(response.data.data);
        toast.success('Detalles cargados');
      } catch (error) {
        toast.error('Error al cargar detalles');
      }
    };

    loadPaymentDetails();
  }, [paymentId]);

  if (!payment) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalles del Pago</h1>
      <p><strong>Fecha:</strong> {payment.fechaVisita}</p>
      <p><strong>Servicio:</strong> {payment.serviceName}</p>
      <p><strong>Mascota:</strong> {payment.petName}</p>
      <p><strong>Monto:</strong> ${payment.montoTotal}</p>
      <p><strong>Notas:</strong> {payment.notas}</p>
    </div>
  );
};

export default PaymentDetails;
