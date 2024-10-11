import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "../../components/DropDown";

import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function MyStock() {
  const navigate = useNavigate();

  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [booleanAddMeal, setBooleanAddMeal] = useState(false);

  const [stock, setStock] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockCollectionRef = collection(db, 'stock');
        const querySnapshot = await getDocs(stockCollectionRef);
        const stockData = querySnapshot.docs.map(doc => doc.data());
        setStock(stockData);
      } catch (error) {
        console.error("Error al obtener el stock:", error);
      }
    }

    if (!booleanAddMeal) {
      fetchStock(); // Ejecuta la función cuando se carga el componente
    }
  }, [setBooleanAddMeal]);

  const handleInputChange = (field, value) => {
    switch (field) {
      case "food":
        setFood(value);
        break;
      case "quantity":
        setQuantity(value);
        break;
      case "unit":
        setUnit(value);
        break;
      default:
        break;
    }
  };

  const handleSaveButton = async () => {
    const mealData = {
      food,
      quantity,
      unit,
    };

    setFood("");
    setQuantity("");
    setUnit("g");

    try {
      const docRef = await addDoc(collection(db, "stock"), mealData);
    } catch (e) {
      console.error("Error al guardar la dieta: ", e);
    }

    setBooleanAddMeal(false);
  }

  return (
    <div>
      <button onClick={() => navigate("/")}>Volver</button>
      <h1>Mi Stock</h1>
      <button onClick={() => setBooleanAddMeal(true)}>Añadir Comida</button>

      {booleanAddMeal && (
        <div>
          <input
            type="text"
            placeholder="Alimento"
            onChange={(e) => handleInputChange("food", e.target.value)}
          />
          <input
            type="number"
            placeholder="Cantidad"
            onChange={(e) => handleInputChange("quantity", e.target.value)}
          />
          <DropDown
            options={[
              { value: 'g', label: 'Gramos (g)' },
              { value: 'u', label: 'Unidades (u)' },
            ]}
            predeterminated={{ value: 'g', label: 'Gramos (g)' }}
            onSelect={(selected) => handleInputChange("unit", selected.value)} // Necesitarás agregar una función para manejar el cambio
          />
          <button onClick={handleSaveButton}>Guardar</button>
        </div>
      )}

      {stock.map((meal, i) => (
        <div key={`meal-${i}`}>
          <label>{meal.food}: {meal.quantity} {meal.unit}</label>
        </div>
      ))}
    </div>
  );
}

export default MyStock