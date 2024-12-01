import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../data/Constants";
import DropDown from "../../components/DropDown";
import Swal from 'sweetalert2';
import axios from "axios";
import "../../styles/AddDiet.css";

function AddDiet() {
  const navigate = useNavigate();
  const url = getUrl();
  const [dietName, setDietName] = useState("Nueva Dieta");
  const [mealData, setMealData] = useState([]);
  const [mealWeekData, setMealWeekData] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(1);
  const [dayFlags, setDayFlags] = useState(Array.from({ length: 7 }, () => false));
  const [sameForAllDays, setSameForAllDays] = useState(false);

  const handleAddMeal = () => {
    const newMeal = { ingredients: [] };
    setMealData([...mealData, newMeal]);
  };

  const handleAddIngredient = (mealIndex) => {
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
    if (sameForAllDays) {
      setMealWeekData(Array.from({ length: 7 }, () => mealData));
    } 
    else if (dayFlags.some((flag) => flag === false)) {
      const newDayFlags = [...dayFlags];
      newDayFlags[currentDayIndex] = true;
      setDayFlags(newDayFlags);

      setMealWeekData(prev => {
        const updatedMealWeekData = [...prev];
        updatedMealWeekData[currentDayIndex] = mealData;
        return updatedMealWeekData;
      });

      setMealData([]);

      if (currentDayIndex + 1 <= 6) {
        setCurrentDayIndex(currentDayIndex + 1);
      } else {
        setCurrentDayIndex(0);
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
    try {
      const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
      const transformedDays = {};

      mealWeekData.forEach((dayMeals, dayIndex) => {
        const dayName = dayNames[dayIndex];
        transformedDays[dayName] = {};

        dayMeals.forEach((meal, mealIndex) => {
          const mealName = `comida${mealIndex + 1}`;
          const ingredients = {};

          meal.ingredients.forEach((ingredient, ingredientIndex) => {
            ingredients[`alimento${ingredientIndex + 1}`] = {
              name: ingredient.food,
              quantity: parseInt(ingredient.quantity, 10),
              unit: ingredient.unit,
            };
          });

          transformedDays[dayName][mealName] = [ingredients];
        });
      });

      axios.post(`${url}diet`, {
        name: dietName,
        days: transformedDays,
      });
  
      Swal.fire({
        title: "Success!",
        text: "Dieta guardada correctamente",
        icon: "success"
      });
      navigate("/myDiets");
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al guardar la dieta',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  };

  const handleDayChange = (value) => {
    setCurrentDayIndex(value);
    setMealData([]);
  };

  const handleSameForAllDaysToggle = () => {
    setSameForAllDays(!sameForAllDays);
  };

  return (
    <div className="container">
    <div className="header">
      <button onClick={() => navigate("/")}>Inicio</button>
    </div>
      <h1>Añadir Dieta</h1>
      <input type="text" placeholder="Nombre de la dieta" value={dietName} onChange={(e) => setDietName(e.target.value)} />

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

      <button onClick={handleAddMeal}>Añadir Comida</button>
      <button onClick={handleSameForAllDaysToggle}>{sameForAllDays ? 'Misma dieta cada día' : 'Diferente dieta cada día'}</button>
      {mealData.map((meal, i) => (
        <div key={`meal-${i}`} className="new-meal">
          <div className="ingredient-header">
            <label>Comida {i + 1}:</label>
            <button onClick={() => handleAddIngredient(i)}>Añadir Alimento</button>
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
                onSelect={(selected) => handleInputChange(i, j, "unit", selected.value)} 
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

export default AddDiet;
