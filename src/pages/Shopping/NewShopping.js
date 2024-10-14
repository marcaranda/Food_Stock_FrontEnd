import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "../../components/DropDown";

import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

function NewShopping() {
  const navigate = useNavigate();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);
  const [stock, setStock] = useState(null);
  const [selectedDiet, setSelectedDiet] = useState(null); // Cambiado a null

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        const dietsCollectionRef = collection(db, 'diets');
        const querySnapshot = await getDocs(dietsCollectionRef);
        setDiets(querySnapshot.docs);
        const dietNames = querySnapshot.docs.map(doc => doc.data().dietName);
        dietNames.push("Todas las Dietas");
        setDietNames(dietNames); // Guarda los nombres de las dietas en el estado

        const stockCollectionRef = collection(db, 'stock');
        const querySnapshot2 = await getDocs(stockCollectionRef);
        const stockData = querySnapshot2.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        setStock(stockData);
      } catch (error) {
        console.error("Error al obtener los dietName:", error);
      }
    };

    fetchDietNames(); // Ejecuta la función cuando se carga el componente
  }, []);

  const handleSelectChange = (selected) => {
    const selectedDietDoc = diets.find((diet) => diet.data().dietName === selected);
    setSelectedDiet(selectedDietDoc ? selectedDietDoc.data() : null); // Asegúrate de que sea null si no se encuentra
  }

  return (
    <div>
      <button onClick={() => navigate("/")}>Inicio</button>
      <h1>Nueva Compra</h1>

      <DropDown
        options={dietNames.map((dietName) => ({ value: dietName, label: dietName }))}
        predeterminated={{ value: '', label: 'Selecciona una dieta' }}
        onSelect={(selected) => handleSelectChange(selected.value)} // Necesitarás agregar una función para manejar el cambio
      />

      <div>
        <h2>Total de Alimentos:</h2>
        {selectedDiet ? ( // Verifica si selectedDiet no es null
          <ul>
            {Object.entries(selectedDiet.totalFood).map(([food, { quantity, unit }]) => (
              <li key={food}>
                {food}: {quantity} {unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos para mostrar.</p> // Mensaje alternativo si no hay selección
        )}
      </div>

      <div>
        <h2>Stock:</h2>
        {stock ? ( // Verifica si stock no es null
          <ul>
            {stock.map((food) => (
              <li key={food.id}>
                {food.data.food}: {food.data.quantity} {food.data.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos en el stock.</p> // Mensaje alternativo si no hay selección
        )}
      </div>
    </div>
  );
}

export default NewShopping;