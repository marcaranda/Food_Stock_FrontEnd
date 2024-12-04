import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { getUrl } from "../../data/Constants";
import { startOfWeek, add } from 'date-fns';
import { es } from 'date-fns/locale';
import DropDown from "../../components/DropDown";
import WeekCalendar from "../../components/WeekCalendar";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import axios from "axios";
import "../../styles/AddDiet.css";

function AddDiet() {
  const navigate = useNavigate();
  const url = getUrl();
  const [dietName, setDietName] = useState("Nueva Dieta");
  const [mealData, setMealData] = useState([]);
  const [mealWeekData, setMealWeekData] = useState(Array.from({ length: 7 }, () => []));
  const [currentDay, setCurrentDay] = useState(startOfWeek(new Date(), { locale: es }))
  const [dayFlags, setDayFlags] = useState(Array.from({ length: 7 }, () => false));
  const [sameForAllDays, setSameForAllDays] = useState(false);
  const [favorite, setFavorite] = useState(false);

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

  const handleFavoriteClick = () => {
    setFavorite(prevFavorite => !prevFavorite);
  };

  const handleSaveButton = () => {
    if (sameForAllDays) {
      setMealWeekData(Array.from({ length: 7 }, () => mealData));
      setDayFlags(Array.from({ length: 7 }, () => true));
    } 
    else if (dayFlags.some((flag) => flag === false)) {
      setDayFlags(prevFlags => {
        const updatedFlags = [...prevFlags];
        updatedFlags[currentDay.getDay()] = true;
        return updatedFlags;
      });

      setMealWeekData(prev => {
        const updatedMealWeekData = [...prev];
        updatedMealWeekData[currentDay.getDay()] = mealData;
        return updatedMealWeekData;
      });

      const nextDate = add(currentDay, { days: 1 })
      setCurrentDay(nextDate);
      setMealData(mealWeekData[nextDate.getDay()]);


      Swal.fire({
        title: "Success!",
        text: "Día guardado correctamente",
        icon: "success"
      });
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
              favorite: favorite,
            };
          });

          transformedDays[dayName][mealName] = [ingredients];
        });
      });

      axios.post(`${url}diet`, {
        name: dietName,
        days: transformedDays,
      })
        .then(() => {
          Swal.fire({
            title: "Success!",
            text: "Dieta guardada correctamente",
            icon: "success"
          });
          navigate("/myDiets");
        });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al guardar la dieta',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  };

  const handleCalendarChange = (date) => {
    setCurrentDay(date);
    setMealData(mealWeekData[date.getDay()]);
  }

  const handleSameForAllDaysToggle = () => {
    setSameForAllDays(!sameForAllDays);
  };

  return (
    <div className="container">
      <div className="header">
        <Navbar />
      </div>
      <h1>Añadir Dieta</h1>
      
      <div className="diet-header">
        <div className="calendar-row">
          <input
            type="text" 
            placeholder="Nombre de la dieta" 
            value={dietName} 
            onChange={(e) => setDietName(e.target.value)} 
          />
          <button onClick={handleFavoriteClick}>
            <FontAwesomeIcon icon={faStar} color={favorite ? "gold" : "white"} />
          </button>
        </div>
        <div className="calendar-row-one-item">
          <WeekCalendar
            calendarDate={currentDay}
            showDayNumber={false}
            handleCalendarChange={handleCalendarChange}
            dayFlags={dayFlags}
          />
        </div>
        <div className="buttons-diet-header">
          <button onClick={handleAddMeal}>Añadir Comida</button>
          <button onClick={handleSameForAllDaysToggle}>{sameForAllDays ? 'Diferente dieta cada día' : 'Misma dieta cada día'}</button>
        </div>
      </div>
      
      {mealData.map((meal, i) => (
        <div key={`meal-${i}`} className="meal-container">
          <div className="meal-header">
            <label>Comida {i + 1}:</label>
            <div className="buttons-meal-header">
              <button onClick={() => handleAddIngredient(i)}>Añadir Alimento</button>
              <button className="delete-button" onClick={() => handleDeleteMeal(i)}>Eliminar Comida</button>
            </div>
          </div>
          {meal.ingredients.map((ingredient, j) => (
            <div key={`ingredient-${i}-${j}`} className="ingredient-container">
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
                boolDays={false}
              />
              <button className="delete-ingredient-button" onClick={() => handleDeleteIngredient(i, j)}>Eliminar Alimento</button>
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSaveButton}>Guardar</button>
    </div>
  );
}

export default AddDiet;
