import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "../../components/DropDown";
import styles from "./MyStock.module.css";

import { db } from "../../firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

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

    fetchStock();
  }, [stock]);

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

  const handleInputUpdateChange = (index, value) => {
    const newStock = [...stock];
    newStock[index].quantity = value;
    setStock(newStock);
  }

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
      await setDoc(doc(db, "stock", mealData.food), mealData);
    } catch (e) {
      console.error("Error al guardar la dieta: ", e);
    }

    setBooleanAddMeal(false);
  }

  const handleSaveUpdateButton = async (index) => {
    const food = stock[index];

    try {
      await setDoc(doc(db, "stock", food.food), food, { merge: true });
    } catch (e) {
      console.error("Error al guardar la dieta: ", e);
    }
  }

  const handleDeleteButton = async (index) => {
    const food = stock[index];
    
    const newStock = [...stock];
    newStock.splice(index, 1);
    setStock(newStock);

    try {
      const foodDocRef = doc(db, "stock", food.food);
      await deleteDoc(foodDocRef);
      console.log(`Food ${food.food} deleted from stock`);
      
    } catch (error) {
        console.error("Error deleting food from stock:", error);
    }
  }

  return (
    <div>
      <button onClick={() => navigate("/")}>Inicio</button>
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
            onSelect={(selected) => handleInputChange("unit", selected.value)}
          />
          <button onClick={handleSaveButton}>Guardar</button>
        </div>
      )}

      <div>
        <h2>Stock:</h2>
        {stock ? ( // Verifica si stock no es null
          <ul>
            {stock.map((food, i) => (
              <li key={food.id} className={styles["ingredient"]}>
              <label htmlFor={`food-${food.id}`}>{food.food}: </label>
              <input
                id={`food-${food.id}`}
                type="number"
                value={food.quantity}
                onChange={(e) => handleInputUpdateChange(i, e.target.value)} // Aquí puedes manejar el cambio
              />
              <span>{food.unit}</span>
              <button onClick={() => handleSaveUpdateButton(i)}>Actualizar</button>
              <button onClick={() => handleDeleteButton(i)}>Eliminar</button>
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

export default MyStock