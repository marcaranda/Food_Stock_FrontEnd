import { useState, useEffect } from "react";
import { getUrl } from '../data/Constants';
import { format, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import ConfirmMeal from "./ConfirmMeal";
import Swal from 'sweetalert2';
import axios from "axios";
import "../styles/components/MealList.css";

function MealList({ dietName, calendarDate, showEditButton }) {
  const url = getUrl();
  const actualDate = new Date();
  const [diet, setDiet] = useState([]);
  const [selectedDayMeals, setSelectedDayMeals] = useState([]);
  const [mealsConfirmed, setMealsConfirmed] = useState([]);
  const [showConfirmMeal, setShowConfirmMeal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const decodedDietName = decodeURIComponent(dietName);

        // Obtener la dieta específica
        await axios.get(`${url}diet/${decodedDietName}`)
          .then((response) => {
            const dietData = response.data.diet;
            setDiet(dietData.days);
          });        
      } catch (error) {
        console.error('Error fetching diet:', error);
      }
    };

    fetchDiet();
    getDayMeals(new Date());
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const getConfirmedMeals = async () => {
      try {
        const dateFormatted = format(calendarDate, 'yyyy-MM-dd');

        await axios.get(`${url}confirmedDay/${dateFormatted}/${dietName}/meals`)
          .then((response) => {
            setMealsConfirmed(response.data.confirmedMeals);
          });
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    };

    getConfirmedMeals();
    // eslint-disable-next-line
  }, [calendarDate]);

  useEffect(() => {
    getDayMeals(calendarDate);
    // eslint-disable-next-line
  }, [diet]);

  const handleConfirmMeal = (meal, mealKey) => {
    if (isSameDay(calendarDate, actualDate) || isBefore(calendarDate, actualDate)) {
      try {
        meal.map((ingredientObject) => (
          Object.entries(ingredientObject).map(([ingredientKey, ingredient]) => (
            axios.get(`${url}stock/${ingredient.name}`)
              .then((response) => {
                const newStock = {
                  name: response.data.stock.name,
                  quantity: response.data.stock.quantity - ingredient.quantity,
                  unit: response.data.stock.unit,
                }

                axios.put(`${url}stock/`, newStock)
              })
          ))
        ));

        const confirmedMeal = [{
          [mealKey]: meal
        }];

        axios.put(`${url}/confirmMeal`, {
          dietName: dietName,
          date: format(calendarDate, 'yyyy-MM-dd'),
          meal: confirmedMeal,
        })

        const newMealsConfirmed = [...mealsConfirmed];
        newMealsConfirmed.push({meal: confirmedMeal});
        setMealsConfirmed(newMealsConfirmed);

        Swal.fire({
          title: "Success!",
          text: "Stock modificado correctamente",
          icon: "success"
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Error al obtener el stock',
          icon: 'error',
          confirmButtonText: 'Cool'
        });
      }
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'No puedes confirmar una comida del futuro',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  const handleShowConfirmMeal = (meal, mealKey) => {
    if (isSameDay(calendarDate, actualDate) || isBefore(calendarDate, actualDate)) {
      setSelectedMeal({meal : meal, mealKey : mealKey});
      setShowConfirmMeal(true);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'No puedes confirmar una comida del futuro',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  // eslint-disable-next-line
  const handleEditMeal = (meal) => {
    console.log(meal);
  }

  function getDayMeals(date) {
    const dayKey = format(date, 'EEEE', { locale: es }).toLowerCase();
    setSelectedDayMeals(diet[dayKey]);
  }

  function isMealConfirmed(mealKey) {
    return mealsConfirmed.some(meal => meal.meal.hasOwnProperty(mealKey));
  }
  
  return (
    <div>
      {selectedDayMeals ? (
        <ul className="meal-list">
        {Object.entries(selectedDayMeals).map(([mealKey, meal], index) => (
          <div>
            {isMealConfirmed(mealKey) ? (
              <li className="meal-item confirmed" key={index}>
                <div className="meal-header">
                  <h3>Comida {index + 1}:</h3>
                </div>
                <h4>Alimentos:</h4>
                <ul className="ingredient-list">
                  {mealsConfirmed.map((ingredientObject, i) => (
                    Object.entries(ingredientObject).map(([ingredientKey, ingredient], j) => (
                    <li className="ingredient-item" key={`${i}-${j}`}>
                      <p>{ingredient.name}: {ingredient.quantity} {ingredient.unit}</p>
                    </li>
                    ))
                  ))}
                </ul>
              </li>
            ) : (
              <li className={`meal-item ${isMealConfirmed(mealKey) ? "confirmed" : ""}`} key={index}>
                <div className="meal-header">
                  <h3>Comida {index + 1}:</h3>
                  <div className="meal-buttons">
                    <button onClick={() => handleShowConfirmMeal(meal, mealKey)}>Confirmar</button>
                    {showEditButton &&
                      <button onClick={() => handleConfirmMeal(meal)}>Editar</button>
                    }
                  </div>
                </div>
                <h4>Alimentos:</h4>
                <ul className="ingredient-list">
                  {meal.map((ingredientObject, i) => (
                    Object.entries(ingredientObject).map(([ingredientKey, ingredient], j) => (
                    <li className="ingredient-item" key={`${i}-${j}`}>
                      {ingredient.name}: {ingredient.quantity} {ingredient.unit}
                    </li>
                    ))
                  ))}
                </ul>
              </li>
            )}
            {showConfirmMeal &&
              <ConfirmMeal
                dietName={dietName}
                meal={selectedMeal.meal}
                mealKey={selectedMeal.mealKey}
                setShowConfirmMeal={setShowConfirmMeal}
              />
            }
          </div>
        ))}
      </ul>
      ) : (
        <p>No hay comidas para este día.</p>
      )}
    </div>
  );
}

export default MealList;