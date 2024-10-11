import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "../../components/DropDown";

import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

function NewShopping() {
  const navigate = useNavigate();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState("Todas las Dietas");

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        const dietsCollectionRef = collection(db, 'diets');
        const querySnapshot = await getDocs(dietsCollectionRef);
        setDiets(querySnapshot.docs); // Guarda los documentos de las dietas en el estado
        const dietNames = querySnapshot.docs.map(doc => doc.data().dietName);
        dietNames.unshift("Todas las Dietas");
        setDietNames(dietNames); // Guarda los nombres de las dietas en el estado
      } catch (error) {
        console.error("Error al obtener los dietName:", error);
      }
    };

    fetchDietNames(); // Ejecuta la función cuando se carga el componente
  }, []);

  const handleSelectChange = (selected) => {
    setSelectedDiet(selected);
    console.log(selected);
  }

  return (
    <div>
      <button onClick={() => navigate("/")}>Volver</button>
      <h1>Nueva Compra</h1>

      <DropDown
        options={dietNames.map((dietName) => ({ value: dietName, label: dietName }))}
        predeterminated={{ value: 'Todas las Dietas', label: 'Todas las Dietas' }}
        onSelect={(selected) => handleSelectChange(selected.value)} // Necesitarás agregar una función para manejar el cambio
      />
    </div>
  );
}

export default NewShopping