import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "../../components/DropDown";

import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

function AddDiet() {
  const navigate = useNavigate();
  const [dietName, setDietName] = useState("Nueva Dieta");
  const [numMeals, setNumMeals] = useState(0);
  const [mealData, setMealData] = useState([]);

  const handleAddNumMeals = () => {
    const newMeal = { ingredients: [] };
    setMealData([...mealData, newMeal]);
    setNumMeals(numMeals + 1);
  };

  const handleAddNumIngredients = (mealIndex) => {
    const newMealData = [...mealData];
    newMealData[mealIndex].ingredients.push({ food: "", quantity: "", unit: "g" });
    setMealData(newMealData);
  };

  const handleDeleteMeal = (index) => {
    const newMealData = mealData.filter((_, i) => i !== index);
    setMealData(newMealData);
    setNumMeals(newMealData.length);
  };

  const handleInputChange = (mealIndex, ingredientIndex, field, value) => {
    const newMealData = [...mealData];
    newMealData[mealIndex].ingredients[ingredientIndex][field] = value;
    setMealData(newMealData);
  };

  const handleSaveButton = async () => {
    const dietData = {
      dietName,
      meals: mealData,
    };

    try {
      const docRef = await addDoc(collection(db, "diets"), dietData);
      navigate("/");
    } catch (e) {
      console.error("Error al guardar la dieta: ", e);
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>Volver</button>
      <h1>Añadir Dieta</h1>
      <input type="text" placeholder="Nombre de la dieta" value={dietName} onChange={(e) => setDietName(e.target.value)}/>
      <button onClick={handleAddNumMeals}>Añadir Comida</button>
      {mealData.map((meal, i) => (
        <div key={`meal-${i}`}>
          <label>Comida {i + 1}:</label>
          <button onClick={() => handleAddNumIngredients(i)}>Añadir Alimento</button>
          <button onClick={() => handleDeleteMeal(i)}>Eliminar Comida</button>
          {meal.ingredients.map((ingredient, j) => (
            <div key={`ingredient-${i}-${j}`}>
              <label>Alimento {j + 1}:</label>
              <input
                type="text"
                placeholder="Alimento"
                value={ingredient.food}
                onChange={(e) => handleInputChange(i, j, "food", e.target.value)}
              />
              <input
                type="number"
                placeholder="Cantidad"
                value={ingredient.quantity}
                onChange={(e) => handleInputChange(i, j, "quantity", e.target.value)}
              />
              <DropDown
                options={[
                  { value: 'g', label: 'Gramos (g)' },
                  { value: 'u', label: 'Unidades (u)' },
                ]}
                predeterminated={{ value: ingredient.unit, label: ingredient.unit === 'g' ? 'Gramos (g)' : 'Unidades (u)' }}
                onSelect={(selected) => handleInputChange(i, j, "unit", selected.value)} // Necesitarás agregar una función para manejar el cambio
              />
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSaveButton}>Guardar</button>
    </div>
  );
}

export default AddDiet