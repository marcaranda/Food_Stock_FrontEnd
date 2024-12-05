import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { getUrl } from "../../data/Constants";
import { startOfWeek, add } from 'date-fns';
import { es } from 'date-fns/locale';
import DropDown from "../../components/DropDown";
import WeekCalendar from "../../components/WeekCalendar";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import axios from "axios";
import "../../styles/AddTraining.css";

function AddTraining() {
  const navigate = useNavigate();
  const url = getUrl();
  const [trainingName, setTrainingName] = useState("Nuevo Entrenamiento");
  const [exerciseData, setExerciseData] = useState([]);
  const [exerciseWeekData, setExerciseWeekData] = useState(Array.from({ length: 7 }, () => []));
  const [currentDay, setCurrentDay] = useState(startOfWeek(new Date(), { locale: es }))
  const [dayFlags, setDayFlags] = useState(Array.from({ length: 7 }, () => false));
  const [sameForAllDays, setSameForAllDays] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const handleAddExercise = () => {
    const newExercise = { sets: [] };
    setExerciseData([...exerciseData, newExercise]);
  };

  const handleDeleteExercise = (index) => {
    const newExerciseData = exerciseData.filter((_, i) => i !== index);
    setExerciseData(newExerciseData);
  };

  const handleInputChange = (exerciseIndex, setIndex, field, value) => {
    const newExerciseData = [...exerciseData];
    newExerciseData[exerciseIndex].sets[setIndex][field] = value;
    setExerciseData(newExerciseData);
  };

  const handleFavoriteClick = () => {
    setFavorite(prevFavorite => !prevFavorite);
  };

  useEffect(() => {
    if (exerciseWeekData.length === 7 && exerciseWeekData.every(day => day.length > 0)) {
      saveToDatabase();
    }

    // eslint-disable-next-line
  }, [exerciseWeekData]);

  const saveToDatabase = async () => {
    try {

    } catch (error) {

    }
  };

  const handleCalendarChange = (date) => {
    setCurrentDay(date);
    //setMealData(mealWeekData[date.getDay()]);
  };

  const handleSameForAllDaysToggle = () => {
    setSameForAllDays(!sameForAllDays);
  };

  return (

    <div className="container">
      <div className="header">
        <Navbar />
      </div>
      <h1>Añadir Dieta</h1>
      
      <div className="training-header">
        <div className="calendar-row">
          <input
            type="text" 
            placeholder="Nombre del entrenamiento"
            value={trainingName} 
            onChange={(e) => setTrainingName(e.target.value)} 
          />
          <button onClick={handleFavoriteClick}>
            <FontAwesomeIcon icon={faStar} color={favorite ? "gold" : "white"} />
          </button>
        </div>
        <div className="calendar-row-one-item">
          <WeekCalendar
            calendarDate={currentDay}
            showDayNumber={false}
            handleCalendarChange={handleCalendarChange}
            dayFlags={dayFlags}
          />
        </div>
        <div className="buttons-training-header">
          <button onClick={handleAddExercise}>Añadir Entreno</button>
          <button onClick={handleSameForAllDaysToggle}>{sameForAllDays ? 'Diferente entreno cada día' : 'Misma entreno cada día'}</button>
        </div>
      </div>

      {exerciseData.map((exercise, i) => (
        <div key={`exercise-${i}`} className="exercise-container">
          <div className="exercise">
            <label>Ejercicio {i + 1}:</label>
            <input
              type="text"
              placeholder="Nombre del ejercicio"
              value={exercise.name}
              onChange={(e) => handleInputChange(i, 'name', e.target.value)}
            />
            <DropDown
              options={[
                { value: 'Gym', label: 'Gym' },
                { value: 'Fútbol', label: 'Fútbol' },
                { value: 'Correr', label: 'Correr' },
                { value: 'Ciclismo', label: 'Ciclismo' },
                { value: 'Natación', label: 'Natación' },
              ]}
              predeterminated={{ value: exercise.type, label: exercise.type }}
              onSelect={(selected) => handleInputChange(i, "type", selected.value)} 
              boolDays={false}
            />
            <input
              type="text"
              placeholder="Información"
              value={exercise.description}
              onChange={(e) => handleInputChange(i, 'information', e.target.value)}
            />
            <div className="buttons-exercise">
              <button onClick={() => handleDeleteExercise(i)}>Eliminar Ejercicio</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AddTraining;