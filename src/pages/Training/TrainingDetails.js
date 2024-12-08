import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faList } from "@fortawesome/free-solid-svg-icons";
import { useParams } from 'react-router-dom';
import { getUrl } from "../../data/Constants";
import { format, getDay, isSameDay, set } from 'date-fns';
import { de, es } from 'date-fns/locale';
import WeekCalendar from "../../components/WeekCalendar";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import axios from "axios";
import "../../styles/TrainingDetails.css";
import 'react-calendar/dist/Calendar.css';

function TrainingDetails() {
  const url = getUrl();
  const actualDate = new Date();
  const { trainingName } = useParams();
  const [training, setTraining] = useState([]);
  const [selectedDayExercises, setSelectedDayExercises] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [exercisesConfirmed, setExercisesConfirmed] = useState([]);

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const decodedTrainingName = decodeURIComponent(trainingName);

        // Obtener el entrenamiento específico
        await axios.get(`${url}training/${decodedTrainingName}`)
          .then((response) => {
            const trainingData = response.data.training;
            setTraining(trainingData.days);
          });        
      } catch (error) {
        console.error('Error fetching training:', error);
      }
    };

    fetchTraining();
    getDayExercises(new Date());
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getDayExercises(calendarDate);
    // eslint-disable-next-line
  }, [training]);

  // eslint-disable-next-line
  const handleEditTraining = (training) => {
    console.log("Editar entrenamiento");
  }

  const handleShowCalendarClick = () => {
    setShowCalendar(prevShowCalendar => !prevShowCalendar);
  }

  const handleCalendarChange = (date) => {
    setCalendarDate(date);
    getDayExercises(date);
    setShowCalendar(false);
  }

  function getDayExercises(date) {
    const dayKey = format(date, 'EEEE', { locale: es }).toLowerCase();
    setSelectedDayExercises(training[dayKey]);
  }

  const handleConfirmTraining = (meal, mealKey) => {
    console.log("Confirmar entrenamiento");
  }

  return (
    <div className="container">
      <div className="header">
        <Navbar />
      </div>

      <h1>{trainingName}</h1>

      <div className="calendar">
        <div className="calendar-row">
          <label>Calendario</label>
          <button
            onClick={handleShowCalendarClick}  
          >
            {showCalendar ? <FontAwesomeIcon icon={faList} /> : <FontAwesomeIcon icon={faCalendar} />}
          </button>
        </div>
        {showCalendar ? (
          <div className="calendar-row-one-item">
            <Calendar 
              value={calendarDate}
              onChange={handleCalendarChange}
              locale="es-ES"
            />
          </div>
        ) : (
          <div className="calendar-row-one-item">
            <WeekCalendar
              calendarDate={calendarDate}
              showDayNumber={true}
              handleCalendarChange={handleCalendarChange}
            />
          </div>
        )}
      </div>

      <h2>Entrenos del {format(calendarDate, 'EEEE', {locale : es}).charAt(0).toUpperCase() + format(calendarDate, 'EEEE', {locale : es}).slice(1)}:</h2>
      {selectedDayExercises ? (
        <ul className="training-list">
          {Object.keys(selectedDayExercises).map((exercise, index) => (
            <li className="training-item" key={index}> 
              <div className="training-header">
                <h3>Entreno {index + 1}:</h3>
                <div className="training-buttons">
                  <button onClick={() => handleConfirmTraining(exercise)}>Confirmar</button>
                  <button onClick={() => handleConfirmTraining(exercise)}>Editar</button>
                </div>
              </div>
              <label>exercise.name</label>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay entrenos para este día</p>
      )}
    </div>
  );
};

export default TrainingDetails;