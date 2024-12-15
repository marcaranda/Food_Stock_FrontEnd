import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faList } from "@fortawesome/free-solid-svg-icons";
import { useParams, useLocation } from 'react-router-dom';
import { getUrl } from "../../data/Constants";
import { format, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import WeekCalendar from "../../components/WeekCalendar";
import ConfirmExercise from "../../components/ConfirmExercise";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import axios from "axios";
import "../../styles/pages/TrainingDetails.css";
import 'react-calendar/dist/Calendar.css';

function TrainingDetails() {
  const url = getUrl();
  const location = useLocation();
  const actualDate = new Date();
  const { trainingName } = useParams();
  const [training, setTraining] = useState([]);
  const [selectedDayExercises, setSelectedDayExercises] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showConfirmExercise, setShowConfirmExercise] = useState(false);
  const [exercisesConfirmed, setExercisesConfirmed] = useState([]);
  const [stravaCode, setStravaCode] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);

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
    const getConfirmedExercises = async () => {
      try {
        const dateFormatted = format(calendarDate, 'yyyy-MM-dd');

        await axios.get(`${url}confirmedExercise/${dateFormatted}`)
          .then((response) => {
            setExercisesConfirmed(response.data.confirmedExercise.exercises);
          });
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    getConfirmedExercises();
    // eslint-disable-next-line
  }, [calendarDate]);

  useEffect(() => {
    getDayExercises(calendarDate);
    // eslint-disable-next-line
  }, [training]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code !== null) {
      console.log(code);
      setStravaCode(code);
      setSelectedExercise(JSON.parse(localStorage.getItem('selectedExercise')));
    }
  }, [location]);

  useEffect (() => {
    if (stravaCode === null || stravaCode === '') return;
    try {
      console.log({
        trainingName: trainingName,
        date: format(calendarDate, 'yyyy-MM-dd'),
        exercise: selectedExercise,
      });

      axios.put(`${url}confirmedExercise?code=${stravaCode}`, {
        trainingName: trainingName,
        date: format(calendarDate, 'yyyy-MM-dd'),
        exercise: selectedExercise,
      })
        .then(() => {
          const newExercisesConfirmed = [...exercisesConfirmed];
          newExercisesConfirmed.push({exercise: selectedExercise});
          setExercisesConfirmed(newExercisesConfirmed);

          localStorage.removeItem('selectedExercise');

          Swal.fire({
            title: "Success!",
            text: "Ejercicio confirmado correctamente",
            icon: "success"
          });
        });
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
    // eslint-disable-next-line
  }, [stravaCode]);

  // eslint-disable-next-line
  const handleEditTraining = (training) => {
    console.log("Editar entrenamiento");
  }

  const handleShowCalendarClick = () => {
    setShowCalendar(prevShowCalendar => !prevShowCalendar);
  }

  const handleShowConfirmExercise = (exercise, exerciseKey) => {
    setSelectedExercise({exercise : exercise, exerciseKey : exerciseKey});
    setShowConfirmExercise(true);
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

  const handleConfirmTraining = (exercise, exerciseKey) => {
    if (isSameDay(calendarDate, actualDate) || isBefore(calendarDate, actualDate)) {
      try {
        const confirmedExercise = {
          [exerciseKey]: exercise
        }

        axios.put(`${url}confirmedExercise`, {
          date: format(calendarDate, 'yyyy-MM-dd'),
          exercise: confirmedExercise,
        })
          .then(() => {
            const newExercisesConfirmed = [...exercisesConfirmed];
            newExercisesConfirmed.push({exercise: confirmedExercise});
            setExercisesConfirmed(newExercisesConfirmed);

            Swal.fire({
              title: "Success!",
              text: "Ejercicio confirmado correctamente",
              icon: "success"
            });
          });
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'No puedes confirmar una entreno del futuro',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  function isExerciseConfirmed(exerciseKey) {
    return exercisesConfirmed.some(exercise => exercise.exercise.hasOwnProperty(exerciseKey));
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
        <ul className="exercise-list">
          {Object.keys(selectedDayExercises).map((exerciseKey, index) => {
            const exercise = selectedDayExercises[exerciseKey]; // Obtén el objeto correspondiente al ejercicio
            return (
              <li className={`exercise-item ${isExerciseConfirmed(exerciseKey) ? "confirmed" : ""}`} key={index}>
                <div className="exercise-header">
                  <h3>Entreno {index + 1}:</h3>
                  {!isExerciseConfirmed(exerciseKey) &&
                    <div className="exercise-buttons">
                      <button onClick={() => handleShowConfirmExercise(exercise, exerciseKey)}>Confirmar</button>
                      <button onClick={() => handleConfirmTraining(exercise)}>Editar</button>
                    </div>
                  }
                </div>
                <div className="exercise-body">
                  <label>{exercise.name}</label>
                  <label>{exercise.type}</label>
                  <label>{exercise.information}</label>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No hay entrenos para este día</p>
      )}
      {showConfirmExercise &&
        <ConfirmExercise
          trainingName={trainingName}
          exercise={selectedExercise.exercise}
          exerciseKey={selectedExercise.exerciseKey}
          exercisesConfirmed={exercisesConfirmed}
          setExercisesConfirmed={setExercisesConfirmed}
          calendarDate={calendarDate}
          actualDate={actualDate}
          setShowConfirmExercise={setShowConfirmExercise}
          setSelectedExercise={setSelectedExercise}
          setStravaCode={setStravaCode}
        />
      }
    </div>
  );
};

export default TrainingDetails;