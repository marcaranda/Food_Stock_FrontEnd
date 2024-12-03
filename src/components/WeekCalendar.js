import React, { useState, useEffect } from "react";
import { endOfWeek, startOfWeek, format, add, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import "../styles/WeekCalendar.css";

function WeekCalendar({calendarDate, showDayNumber, handleCalendarChange, dayFlags}) {
  const [days, setDays] = useState([]);

  const getWeekDays = () =>{
    const start = startOfWeek(calendarDate, { locale: es });
    const end = endOfWeek(calendarDate, { locale: es });

    const daysList = [];
    let day = start;

    while (day <= end) {
      daysList.push(day);
      day = add(day, { days: 1 });
    }

    setDays(daysList);
  }

  useEffect(() => {
    getWeekDays();
    // eslint-disable-next-line
  }, [calendarDate]);

  return (
    <div className="week-body">
      {days.length > 0 && (
        <>
        <span>Semana {format(days[0], 'dd')} - {format(days[6], 'dd')} del {format(days[0], 'MM-yyyy', { locale : es})}</span>
        <div className="week-container">
          {days.map((day, index) => (
            <button
              className={isSameDay(day, calendarDate) ? 'selected' : (index + 1 === 7 ? (dayFlags[0] ? 'day-saved' : 'non-selected') :
                (dayFlags[index + 1] ? 'day-saved' : 'non-selected'))}
              key={index}
              onClick={() => handleCalendarChange(day)}
            >
              <p>{format(day, 'EEE', { locale : es }).charAt(0).toUpperCase()}</p>
              {showDayNumber && 
                <p>{format(day, 'dd')}</p>
              } 
            </button>
          ))}
        </div>
        </>
      )}
    </div>
  );
}

export default WeekCalendar;