import React, { useState } from "react";
import { getUrl } from "../data/Constants";
import { format, isBefore, isSameDay } from 'date-fns';
import DropDown from "../components/DropDown";
import Swal from 'sweetalert2';
import axios from "axios";
import "../styles/ConfirmModal.css";

function ConfirmModal({trainingName, exercise, exerciseKey, exercisesConfirmed, setExercisesConfirmed, calendarDate, actualDate, setShowConfirmModal}) {
  const url = getUrl();
  const [confirmedExercise, setConfirmedExercise] = useState(exercise);

  const handleConfirmTraining = (exercise, exerciseKey) => {
    if (isSameDay(calendarDate, actualDate) || isBefore(calendarDate, actualDate)) {
      try {
        const confirmedExercise = {
          [exerciseKey]: exercise
        }

        axios.put(`${url}confirmedExercise`, {
          trainingName: trainingName,
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
            onChange={(e) => handleInputChange('notes', e.target.value)}
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

