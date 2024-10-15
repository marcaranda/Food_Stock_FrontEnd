import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "../../components/DropDown";

import { db } from "../../firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

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
          ...doc.data()
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
      const stockItem = stock.find((item) => item.food === food);

      if (!stockItem) {
        // Si el alimento no existe en el stock, lo añadimos a los faltantes
        missing.push({
          food,
          missingQuantity: quantity,
          unit,
        });
      } else {
        // Si el alimento está en el stock pero no es suficiente
        const stockQuantity = stockItem.quantity;
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

  const handleInputUpdateChange = (index, value) => {
    const newMissingItems = [...missingItems];
    newMissingItems[index].missingQuantity = value;
    setMissingItems(newMissingItems);
  }

  const handleComprarButton = (food) => {
    const newStock = [...stock];
    let stockItem = newStock.find((item) => item.food === food.food);

    if (stockItem) {
      stockItem.quantity += parseFloat(food.missingQuantity);
    } 
    else {
      stockItem = {
        food: food.food,
        quantity: parseFloat(food.missingQuantity),
        unit: food.unit,
      };

      newStock.push(stockItem);
    }
    console.log("stockItem", stockItem); 
    saveCompra(stockItem);

    setStock(newStock);
    calculateMissingItems(selectedDiet, newStock);
  }

  const saveCompra = async (stockItem) => {
    try {
      await setDoc(doc(db, "stock", stockItem.food), stockItem, { merge: true });
    } catch (e) {
      console.error("Error al guardar la dieta: ", e);
    }
  }

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
              <li key={food.food}>
                {food.food}: {food.quantity} {food.unit}
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
            {missingItems.map((food, i) => (
              <li key={food.food}  className="ingredient">
                <label htmlFor={`food-${food.food}`}>{food.food}: Faltan </label>
                <input
                id={`food-${food.food}`}
                type="number"
                value={food.missingQuantity}
                onChange={(e) => handleInputUpdateChange(i, e.target.value)} // Aquí puedes manejar el cambio
                />
                <span>{food.unit}</span>
                <button onClick={() => handleComprarButton(food)}>Comprar</button>
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
