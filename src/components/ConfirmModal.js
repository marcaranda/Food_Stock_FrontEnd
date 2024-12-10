import React, { useState } from "react";
import { getUrl, getStravaUrl, getStravaUrl2 } from "../data/Constants";
import { isBefore, isSameDay } from 'date-fns';
import DropDown from "../components/DropDown";
import Swal from 'sweetalert2';
import "../styles/ConfirmModal.css";

function ConfirmModal({trainingName, exercise, exerciseKey, exercisesConfirmed, setExercisesConfirmed, calendarDate, actualDate, setShowConfirmModal, setSelectedExercise, setStravaCode}) {
  const stravaUrl1 = getStravaUrl();
  const stravaUrl2 = getStravaUrl2();
  const [confirmedExercise, setConfirmedExercise] = useState({
    name: exercise.name,
    type: exercise.type,
    information: exercise.information,
    duration: '',
    intensity: '3',
    url: '',
  });

  const handleConfirmTraining = () => {
    if (isSameDay(calendarDate, actualDate) || isBefore(calendarDate, actualDate)) { 
      const exerciseDB = {
        [exerciseKey]: confirmedExercise
      }
      setSelectedExercise(exerciseDB);
      localStorage.setItem('selectedExercise', JSON.stringify(exerciseDB));

      if (confirmedExercise.url !== '' && confirmedExercise.url.includes("strava.com")) {
        const stravaUrl = `${stravaUrl1}${trainingName}${stravaUrl2}`;
        window.location.href = stravaUrl;
      } else{
        setStravaCode(".");
      }
      setShowConfirmModal(false);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'No puedes confirmar una entreno del futuro',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  const handleInputChange = (key, value) => {
    setConfirmedExercise({
      ...confirmedExercise,
      [key]: value
    });
  }

  return (
    <div className="modal-body">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Confirmar Entrenamiento</h2>
        </div>
        
        <div className="modal-content">
          <label>Nombre</label>
          <input 
            type="text"
            placeholder="Nombre del entreno"
            value={confirmedExercise.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          <label>Tipo</label>
          <DropDown
            options={[
              { value: 'Gym', label: 'Gym' },
              { value: 'Fútbol', label: 'Fútbol' },
              { value: 'Correr', label: 'Correr' },
              { value: 'Ciclismo', label: 'Ciclismo' },
              { value: 'Natación', label: 'Natación' },
            ]}
            predeterminated={{ value: confirmedExercise.type, label: confirmedExercise.type }}
            onSelect={(selected) => handleInputChange("type", selected.value)} 
            boolDays={false}
          />
          <label>Duración</label>
          <input
            type="time"
            value={confirmedExercise.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
          />
          <label>Intensidad</label>
          <input
            type="range"
            min="1"
            max="5"
            value={confirmedExercise.intensity}
            onChange={(e) => handleInputChange('intensity', e.target.value)}
          />
          <label>Url app externa</label>
          <input
            type="text"
            placeholder="Url app externa"
            value={confirmedExercise.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
          />
          <label>Información extra</label>
          <input
            type="text"
            placeholder="Información"
            value={confirmedExercise.information}
            onChange={(e) => handleInputChange('information', e.target.value)}
          />
        </div>

        <div className="modal-buttons">
          <button className="confirm-button" onClick={() => handleConfirmTraining(exercise, exerciseKey)}>Confirmar</button>
          <button className="cancel-button" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

