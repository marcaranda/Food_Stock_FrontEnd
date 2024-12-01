import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../data/Constants";
import axios from "axios";
import "../../styles/MyDiets.css";

function MyDiets() {
  const navigate = useNavigate();
  const url = getUrl();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);

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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyDiets