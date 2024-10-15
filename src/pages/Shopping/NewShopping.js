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
  const [missingItems, setMissingItems] = useState([]); // Estado para los alimentos faltantes

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        const dietsCollectionRef = collection(db, 'diets');
        const querySnapshot = await getDocs(dietsCollectionRef);
        setDiets(querySnapshot.docs);
        const dietNames = querySnapshot.docs.map(doc => doc.data().dietName);
        dietNames.push("Todas las Dietas");
        setDietNames(dietNames);

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

    fetchDietNames();
  }, []);

  const handleSelectChange = (selected) => {
    const selectedDietDoc = diets.find((diet) => diet.data().dietName === selected);
    const dietData = selectedDietDoc ? selectedDietDoc.data() : null;
    setSelectedDiet(dietData);
    if (dietData && stock) {
      calculateMissingItems(dietData, stock);
    }
  };

  // Función para calcular los alimentos faltantes
  const calculateMissingItems = (diet, stock) => {
    const missing = [];

    // Recorremos los alimentos requeridos por la dieta
    for (const [food, { quantity, unit }] of Object.entries(diet.totalFood)) {
      // Verificamos si el alimento existe en el stock
      const stockItem = stock.find((item) => item.data.food === food);

      if (!stockItem) {
        // Si el alimento no existe en el stock, lo añadimos a los faltantes
        missing.push({
          food,
          missingQuantity: quantity,
          unit,
        });
      } else {
        // Si el alimento está en el stock pero no es suficiente
        const stockQuantity = stockItem.data.quantity;
        if (stockQuantity < quantity) {
          missing.push({
            food,
            missingQuantity: quantity - stockQuantity,
            unit,
          });
        }
      }
    }

    // Guardamos los alimentos faltantes en el estado
    setMissingItems(missing);
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>Inicio</button>
      <h1>Nueva Compra</h1>

      <DropDown
        options={dietNames.map((dietName) => ({ value: dietName, label: dietName }))}
        predeterminated={{ value: '', label: 'Selecciona una dieta' }}
        onSelect={(selected) => handleSelectChange(selected.value)}
      />

      <div>
        <h2>Total de Alimentos:</h2>
        {selectedDiet ? (
          <ul>
            {Object.entries(selectedDiet.totalFood).map(([food, { quantity, unit }]) => (
              <li key={food}>
                {food}: {quantity} {unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos para mostrar.</p>
        )}
      </div>

      <div>
        <h2>Stock:</h2>
        {stock ? (
          <ul>
            {stock.map((food) => (
              <li key={food.id}>
                {food.data.food}: {food.data.quantity} {food.data.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos en el stock.</p>
        )}
      </div>

      <div>
        <h2>Alimentos faltantes:</h2>
        {missingItems.length > 0 ? (
          <ul>
            {missingItems.map((item) => (
              <li key={item.food}>
                {item.food}: Faltan {item.missingQuantity} {item.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos faltantes.</p>
        )}
      </div>
    </div>
  );
}

export default NewShopping;
