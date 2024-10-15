import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DropDown from "../../components/DropDown";
import "../../styles/AddDiet.css";

import { db } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";

function AddDiet() {
  const navigate = useNavigate();
  const [dietName, setDietName] = useState("Nueva Dieta");
  const [mealData, setMealData] = useState([]);
  const [mealWeekData, setMealWeekData] = useState([]);
  const [day, setDay] = useState(1);
  const [booleanDay, setBooleanDay] = useState(Array.from({ length: 7 }, () => false));
  const [sameAllDays, setSameAllDays] = useState(false);

  const handleAddNumMeals = () => {
    const newMeal = { ingredients: [] };
    setMealData([...mealData, newMeal]);
  };

  const handleAddNumIngredients = (mealIndex) => {
    const newMealData = [...mealData];
    newMealData[mealIndex].ingredients.push({ food: "", quantity: "", unit: "g" });
    setMealData(newMealData);
  };

  const handleDeleteMeal = (index) => {
    const newMealData = mealData.filter((_, i) => i !== index);
    setMealData(newMealData);
  };

  const handleDeleteIngredient = (mealIndex, index) => {
    const newMealData = [...mealData];
    newMealData[mealIndex].ingredients = newMealData[mealIndex].ingredients.filter((_, i) => i !== index);
    setMealData(newMealData);
  };

  const handleInputChange = (mealIndex, ingredientIndex, field, value) => {
    const newMealData = [...mealData];
    newMealData[mealIndex].ingredients[ingredientIndex][field] = value;
    setMealData(newMealData);
  };

  const handleSaveButton = () => {
    if (sameAllDays) {
      setMealWeekData(Array.from({ length: 7 }, () => mealData));
    } 
    else if (booleanDay.some((day) => day === false)) {
      const newBooleanDay = [...booleanDay];
      newBooleanDay[day] = true;
      setBooleanDay(newBooleanDay);

      setMealWeekData(prev => {
        const updatedMealWeekData = [...prev];
        updatedMealWeekData[day] = mealData;
        return updatedMealWeekData;
      });

      setMealData([]);

      if (day + 1 <= 6) {
        setDay(day + 1);
      } else {
        setDay(0);
      }
    }
  };

  useEffect(() => {
    if (mealWeekData.length === 7 && mealWeekData.every(dayMeals => dayMeals.length > 0)) {
      saveToDatabase();
    }
    // eslint-disable-next-line
  }, [mealWeekData]);

  
  const saveToDatabase = async () => {
    console.log("guardar dieta");
      const foodTotals = {};

      mealWeekData.forEach((mealDayData) => {
        mealDayData.forEach((meal) => {
          meal.ingredients.forEach((ingredient) => {
            const { food, quantity, unit } = ingredient;
      
            if (foodTotals[food]) {
              foodTotals[food].quantity += parseFloat(quantity);
            } else {
              foodTotals[food] = { quantity: parseFloat(quantity), unit };
            }
          });
        });
      });

      const dietData = {
        dietName,
        days: mealWeekData.map((dayMeals, index) => ({
          day: index + 1,
          meals: dayMeals.map(meal => ({
            ingredients: meal.ingredients,
          })),
        })),
        totalFood: foodTotals,
      };

      try {
        await setDoc(doc(db, "diets", dietData.dietName), dietData);
        navigate("/");
      } catch (e) {
        console.error("Error al guardar la dieta: ", e);
      }
  };

  const handleDayChange = (value) => {
    setDay(value);
    setMealData([]);
  }

  const handleSameAllDays = () => {
    setSameAllDays(!sameAllDays);
  }

  return (
    <div>
      <button onClick={() => navigate("/")}>Inicio</button>
      <h1>Añadir Dieta</h1>
      <input type="text" placeholder="Nombre de la dieta" value={dietName} onChange={(e) => setDietName(e.target.value)}/>

      <DropDown
        options={[
          { value: '1', label: 'Lunes' },
          { value: '2', label: 'Martes' },
          { value: '3', label: 'Miércoles' },
          { value: '4', label: 'Jueves' },
          { value: '5', label: 'Viernes' },
          { value: '6', label: 'Sábado' },
          { value: '0', label: 'Domingo' },
        ]}
        predeterminated={{ value: 1, label: "Lunes" }}
        onSelect={(selected) => handleDayChange(selected.value)}
      />

      <button onClick={handleAddNumMeals}>Añadir Comida</button>
      <button onClick={handleSameAllDays}>{sameAllDays ? 'Checked' : 'Check'}</button>
      {mealData.map((meal, i) => (
        <div key={`meal-${i}`} className="new-meal">
          <div className="ingredient-header">
            <label>Comida {i + 1}:</label>
            <button onClick={() => handleAddNumIngredients(i)}>Añadir Alimento</button>
            <button onClick={() => handleDeleteMeal(i)}>Eliminar Comida</button>
          </div>
          {meal.ingredients.map((ingredient, j) => (
            <div key={`ingredient-${i}-${j}`} className="new-ingredient">
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
              <button onClick={() => handleDeleteIngredient(i, j)}>Eliminar Alimento</button>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSaveButton}>Guardar</button>
    </div>
  );
}

export default AddDiet