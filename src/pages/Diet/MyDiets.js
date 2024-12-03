import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../data/Constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListDots } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from "axios";
import "../../styles/MyDiets.css";

function MyDiets() {
  const navigate = useNavigate();
  const url = getUrl();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);
  // eslint-disable-next-line
  const [showOptionsDiet, setShowOptionsDiet] = useState(false);

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        axios.get(`${url}diet`)
          .then((response) => {
            const dietsData = response.data.diets;
            setDiets(dietsData); // Guarda los datos de las dietas en el estado
            const dietNamesList = dietsData.map(diet => diet.name); // Suponiendo que la columna se llama 'diet_name'
            setDietNames(dietNamesList); // Guarda los nombres de las dietas en el estado
          })
      } catch (error) {
        console.error("Error al obtener los nombres de las dietas:", error);
      }
    };

    fetchDietNames(); // Ejecuta la función cuando se carga el componente
    // eslint-disable-next-line
  }, []);

  const handleShowOptionsDiet = () => {
    setShowOptionsDiet(prevShowCalendar => !prevShowCalendar);
  }

  const handleCloseOptionsDiet = (event, dietname) => {
    setShowOptionsDiet(false);

    switch (event.target.innerText) {
      case "Editar":
        console.log("Editar dieta");
        break;
      case "Eliminar":
        try { 
        axios.delete(`${url}diet/${dietname}`)
        .then((response) => {
          const updatedDiets = diets.filter(diet => diet.name !== dietname);
          setDiets(updatedDiets);
          const updatedDietNames = dietNames.filter(name => name !== dietname);
          setDietNames(updatedDietNames);

          Swal.fire({
            title: "Success!",
            text: "Dieta eliminada correctamente",
            icon: "success"
          });
        });
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Error al eliminar la dieta',
            icon: 'error',
            confirmButtonText: 'Cool'
          });
        }
        break;
      default:
        break;
    }
  }

  return (
    <div className="container">
      <div className="header">
      <button onClick={() => navigate("/")}>Inicio</button>
      <button onClick={() => navigate("/addDiet")}>Añadir Dieta</button>
      </div>
      <h1>Mis Dietas</h1>
      <ul className="diet-list">
        {dietNames.map((dietName, index) => (
          <li className="diet-item" key={index}>
            <button onClick={() => navigate(`/myDiets/${diets[index].name}`)}>{dietName}</button>
            <button onClick={handleShowOptionsDiet}
            >
              <FontAwesomeIcon icon={faListDots} />
            </button>
              <Menu
                id="simple-menu"
                anchorEl={document.querySelector('.diet-item button:last-child')}
                open={showOptionsDiet}
                onClose={handleShowOptionsDiet}
              >
                <MenuItem onClick={(event) => handleCloseOptionsDiet(event, diets[index].name)}>Editar</MenuItem>
                <MenuItem onClick={(event) => handleCloseOptionsDiet(event, diets[index].name)}>Eliminar</MenuItem>
              </Menu>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyDiets