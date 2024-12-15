import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../data/Constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListDots, faArrowDown, faArrowUp, faClose } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem } from "@mui/material";
import Swal from 'sweetalert2';
import axios from "axios";
import Navbar from "../../components/Navbar";
import "../../styles/pages/MyTrainings.css";

function MyTrainings() {
  const navigate = useNavigate();
  const url = getUrl();
  const [trainings, setTrainings] = useState([]);
  const [trainingNames, setTrainingNames] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [reorder, setReorder] = useState(false);

  useEffect(() => {
    const fetchTrainingNames = async () => {
      try {
        axios.get(`${url}training`)
          .then((response) => {
            const trainingsData = response.data.trainings;
            setTrainings(trainingsData); // Guarda los datos de los entrenamientos en el estado
            const trainingNamesList = trainingsData.map(training => training.name); // Suponiendo que la columna se llama 'training_name'
            setTrainingNames(trainingNamesList); // Guarda los nombres de los entrenamientos en el estado
          })
      } catch (error) {
        console.error("Error al obtener los nombres de los entrenamientos:", error);
      }
    };

    fetchTrainingNames(); // Ejecuta la función cuando se carga el componente
    // eslint-disable-next-line
  }, []);

  const handleShowOptionsTraining = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleCloseOptionsTraining = (event, trainingname) => {
    setAnchorEl(null);

    switch (event.target.innerText) {
      case "Editar":
        console.log("Editar entrenamiento");
        break;
      case "Eliminar":
        try { 
        axios.delete(`${url}training/${trainingname}`)
        .then(() => {
          const updatedTrainings = trainings.filter(training => training.name !== trainingname);
          setTrainings(updatedTrainings);
          const updatedTrainingNames = trainingNames.filter(name => name !== trainingname);
          setTrainingNames(updatedTrainingNames);

          Swal.fire({
            title: "Success!",
            text: "Entrenamiento eliminado",
            icon: "success",
            confirmButtonText: "Ok",
          });
        });
      } catch (error) {
        console.error("Error al eliminar el entrenamiento:", error);
      }
        break;
      case "Reordenar":
        setReorder(true);
        break;
      default:
        break;
    }
  }

  const handleCloseReorder = () => {
    setReorder(false);
  }

  const handleReorder = (trainingName, index, direction) => {
    let newOrder = index + 1;

    switch (direction) {
      case "up":
        newOrder -= 1;
        break;
      case "down":
        newOrder += 1;
        break;
      default:
        break;
    }

    if (newOrder < 0 || newOrder >= trainings.length) {
      Swal.fire({
        title: 'Error!',
        text: 'El nuevo índice está fuera de límites',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
      return;
    }

    try {
      const encondedTrainingName = encodeURIComponent(trainingName);
      axios.put(`${url}training/${encondedTrainingName}/${newOrder}`)
        .then(() => {
          const updatedTrainings = [...trainings];
          const trainingIndex = updatedTrainings.findIndex(training => training.name === trainingName);
          const training = updatedTrainings[trainingIndex];
          updatedTrainings.splice(trainingIndex, 1);
          updatedTrainings.splice(newOrder, 0, training);
          setTrainings(updatedTrainings);
        });
    } catch (error) {
      console.error("Error al reordenar el entrenamiento:", error);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <Navbar />
      </div>
      <h1>Mis Entrenamientos</h1>
      <ul className="training-list">
        {trainings.map((training, index) => (
          <li className="training-item" key={index}>
            <button onClick={() => navigate(`/myTrainings/${training.name}`)}>{training.name}</button>
            {reorder ? (
              <div>
                <button onClick={() => handleReorder(training.name, index, "up")}>
                  <FontAwesomeIcon icon={faArrowUp} />
                </button>
                <button onClick={() => handleReorder(training.name, index, "down")}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </button>
                <button onClick={handleCloseReorder}>
                  <FontAwesomeIcon icon={faClose} />
                </button>
              </div>
            ) : (
              <button onClick={handleShowOptionsTraining}>
                <FontAwesomeIcon icon={faListDots} />
              </button>
            )}
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={(event) => handleCloseOptionsTraining(event, training.name)}>Editar</MenuItem>
              <MenuItem onClick={(event) => handleCloseOptionsTraining(event, training.name)}>Eliminar</MenuItem>
              <MenuItem onClick={(event) => handleCloseOptionsTraining(event, training.name)}>Reordenar</MenuItem>
            </Menu>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyTrainings;