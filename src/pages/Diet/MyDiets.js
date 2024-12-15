import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../data/Constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListDots, faArrowDown, faArrowUp, faClose } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem } from "@mui/material";
import Swal from 'sweetalert2';
import axios from "axios";
import Navbar from "../../components/Navbar";
import "../../styles/pages/MyDiets.css";

function MyDiets() {
  const navigate = useNavigate();
  const url = getUrl();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [reorder, setReorder] = useState(false);

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

  const handleShowOptionsDiet = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleCloseOptionsDiet = (event, dietname) => {
    setAnchorEl(null);

    switch (event.target.innerText) {
      case "Editar":
        console.log("Editar dieta");
        break;
      case "Eliminar":
        try { 
        axios.delete(`${url}diet/${dietname}`)
        .then(() => {
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
      case "Reordenar":
        setReorder(prevReorder => !prevReorder);
        break;
      default:
        break;
    }
  };

  const handleCloseReorder = () => {
    setReorder(false);
  }

  const handleReorder = (dietname, index, direction) => {
    let newOrder = index + 1;

    switch (direction) {
      case "up":
        newOrder -= 1;
        break;
      case "down":
        newOrder += 1;
        break;
      default:
        break
    }

    if (newOrder < 0 || newOrder >= diets.length) {
      Swal.fire({
        title: 'Error!',
        text: 'El nuevo índice está fuera de límites',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
      return;
    }

    try {
      const encodedDietName = encodeURIComponent(dietname);
      axios.put(`${url}diet/changeOrder/${encodedDietName}/${newOrder}`)
        .then(() => {
          const updatedDiets = [...diets];
          const dietIndex = updatedDiets.findIndex(diet => diet.name === dietname);
          const diet = updatedDiets[dietIndex];
          updatedDiets.splice(dietIndex, 1);
          updatedDiets.splice(newOrder, 0, diet);
          setDiets(updatedDiets);
        });
    } catch (error) {
      console.error("Error al reordenar la dieta:", error);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <Navbar />
      </div>
      <h1>Mis Dietas</h1>
      <ul className="diet-list">
        {diets.map((diet, index) => (
          <li className="diet-item" key={index}>
            <button onClick={() => navigate(`/myDiets/${diet.name}`)}>{diet.name}</button>
            {reorder ? ( 
              <div>
                <button onClick={() => handleReorder(diet.name, index, "up")}>
                  <FontAwesomeIcon icon={faArrowUp} />
                </button>
                <button onClick={() => handleReorder(diet.name, index, "down")}>
                <FontAwesomeIcon icon={faArrowDown} />
                </button>
                <button onClick={handleCloseReorder}>
                <FontAwesomeIcon icon={faClose} />
                </button>
              </div>
            ) : (
              <button onClick={handleShowOptionsDiet}>
                <FontAwesomeIcon icon={faListDots} />
              </button>
            )}
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={(event) => handleCloseOptionsDiet(event, diet.name)}>Editar</MenuItem>
              <MenuItem onClick={(event) => handleCloseOptionsDiet(event, diet.name)}>Eliminar</MenuItem>
              <MenuItem onClick={(event) => handleCloseOptionsDiet(event, diet.name)}>Reordenar</MenuItem>
            </Menu>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyDiets