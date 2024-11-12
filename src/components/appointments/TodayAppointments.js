import React, { useState } from 'react';
import DailyAppointmentsTable from '../../components/appointments/DailyAppointmentsTable';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
const TodayAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today's Appointments</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            New Appointment
          </button>
        </div>
      </div>

      <DailyAppointmentsTable selectedDate={selectedDate} />
    </div>
  );
};

export default TodayAppointments;