import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "../../styles/MyDiets.css";

function MyDiets() {
  const navigate = useNavigate();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        const { data, error } = await supabase
          .from('diets') // Nombre de la tabla
          .select('*'); // Selecciona todos los campos

        if (error) throw error; // Maneja el error si ocurre

        setDiets(data); // Guarda los datos de las dietas en el estado
        const dietNamesList = data.map(diet => diet.diet_name); // Suponiendo que la columna se llama 'diet_name'
        setDietNames(dietNamesList); // Guarda los nombres de las dietas en el estado
      } catch (error) {
        console.error("Error al obtener los nombres de las dietas:", error);
      }
    };

    fetchDietNames(); // Ejecuta la función cuando se carga el componente
  }, []);

  return (
    <div className="container">
      <div className="header">
      <button onClick={() => navigate("/")}>Inicio</button>
      <button onClick={() => navigate("/addDiet")}>Añadir Dieta</button>
      </div>
      <h1>Mis Dietas</h1>
      {dietNames.map((dietName, index) => (
        <div key={index}>
          <button className="dieta" onClick={() => navigate(`/myDiets/${diets[index].id}`)}>{dietName}</button>
        </div>
      ))}
    </div>
  );
}

export default MyDiets