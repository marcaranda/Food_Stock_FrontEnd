import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

function MyDiets() {
  const navigate = useNavigate();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        const dietsCollectionRef = collection(db, 'diets');
        const querySnapshot = await getDocs(dietsCollectionRef);
        setDiets(querySnapshot.docs); // Guarda los documentos de las dietas en el estado
        const dietNames = querySnapshot.docs.map(doc => doc.data().dietName);
        setDietNames(dietNames); // Guarda los nombres de las dietas en el estado
      } catch (error) {
        console.error("Error al obtener los dietName:", error);
      }
    };

    fetchDietNames(); // Ejecuta la función cuando se carga el componente
  }, []);

  return (
    <div>
      <button onClick={() => navigate("/")}>Inicio</button>
      <h1>Mis Dietas</h1>
      {dietNames.map((dietName, index) => (
        <div key={index}>
          <button onClick={() => navigate(`/myDiets/${diets[index].id}`)}>{dietName}</button>
        </div>
      ))}
    </div>
  );
}

export default MyDiets