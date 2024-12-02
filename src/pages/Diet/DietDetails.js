import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faList } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { getUrl } from "../../data/Constants";
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import WeekCalendar from "../../components/WeekCalendar";
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import axios from "axios";
import "../../styles/DietDetails.css";
import 'react-calendar/dist/Calendar.css';

function DietDetails() {
  const navigate = useNavigate();
  const url = getUrl();
  const { dietName } = useParams();
  const [diet, setDiet] = useState([]);
  const [selectedDayMeals, setSelectedDayMeals] = useState([]);
  const [totalFood, setTotalFood] = useState([]);
  const [showTotalFood, setShowTotalFood] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [mealsConfirmed, setMealsConfirmed] = useState([]);
  const actualDate = new Date();

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const decodedDietName = decodeURIComponent(dietName);

        // Obtener la dieta específica
        await axios.get(`${url}diet/${decodedDietName}`)
          .then((response) => {
            const dietData = response.data.diet;
            setDiet(dietData.days);
            setTotalFood(dietData.totalFood);
          });

        await axios.get(`${url}meal`)
          .then((response) => {
            setMealsConfirmed(response.data.meals);
          });
        
      } catch (error) {
        console.error('Error fetching diet:', error);
      }
    };

    fetchDiet();
    setSelectedDayMeals(getDayMeals(new Date()));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getDayMeals(calendarDate);
    // eslint-disable-next-line
  }, [diet]);

  const handleConfirmMeal = (meal, mealKey) => {
    if (isSameDay(actualDate, calendarDate)) {
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

        axios.put(`${url}meal`, {
          date: format(calendarDate, 'yyyy-MM-dd'),
          meal: mealKey,
        });

        const newMealsConfirmed = [...mealsConfirmed];
        const mealIndex = newMealsConfirmed.findIndex(meal => meal.date === format(calendarDate, 'yyyy-MM-dd'));
        
        if (mealIndex !== -1) {
          newMealsConfirmed[mealIndex].meals.push(mealKey);
        } else {
          newMealsConfirmed.push({
            date: format(calendarDate, 'yyyy-MM-dd'),
            meals: [mealKey],
          });
        }

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
        text: 'No puedes confirmar una comida que no es de hoy',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  // eslint-disable-next-line
  const handleEditMeal = (meal) => {
    console.log(meal);
  }

  const handleShowCalendarClick = () => {
    setShowCalendar(prevShowCalendar => !prevShowCalendar);
  }

  const handleShowTotalFood = () => {
    setShowTotalFood(prevShowTotalFood => !prevShowTotalFood);
  }

  const handleCalendarChange = (date) => {
    setCalendarDate(date);
    getDayMeals(date);
    setShowCalendar(false);
  }

  function getDayMeals(date) {
    const dayKey = format(date, 'EEEE', { locale: es }).toLowerCase();
    setSelectedDayMeals(diet[dayKey]);
  }

  function isMealConfirmed(mealKey) {
    return mealsConfirmed.some(meal => meal.date === format(calendarDate, 'yyyy-MM-dd') && meal.meals.includes(mealKey));
  }

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate("/")}>Inicio</button>
        <button onClick={() => navigate("/myDiets")}>Volver</button>
      </div>

      <h1>{dietName}</h1>

      <div className="calendar">
        <div className="calendar-row">
          <label>Calendario</label>
          <button
            onClick={handleShowCalendarClick}  
          >
            {showCalendar ? <FontAwesomeIcon icon={faList} /> : <FontAwesomeIcon icon={faCalendar} />}
          </button>
        </div>
        {showCalendar ? (
          <div className="calendar-row-one-item">
            <Calendar 
              value={calendarDate}
              onChange={handleCalendarChange}
              locale="es-ES"
            />
          </div>
        ) : (
          <div className="calendar-row-one-item">
            <WeekCalendar
              calendarDate={calendarDate}
              showDayNumber={true}
              handleCalendarChange={handleCalendarChange}
            />
          </div>
        )}
        <div className="calendar-row-one-item">
          <button onClick={handleShowTotalFood}>{showTotalFood ? 'Ver Comida Diaria' : 'Ver Comida Semanal'}</button>
        </div>
      </div>

      {showTotalFood ? (
        <div>
          <h2>Total de Alimentos:</h2>
          <ul>
            {totalFood.map((food, index) => (
              <li key={index}>
                {food.name}: {food.quantity} {food.unit}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <h2>Comidas del {format(calendarDate, 'EEEE', {locale : es}).charAt(0).toUpperCase() + format(calendarDate, 'EEEE', {locale : es}).slice(1)}:</h2>
          {selectedDayMeals ? (
            <ul className="meal-list">
              {Object.entries(selectedDayMeals).map(([mealKey, meal], index) => (
                <li className={`meal-item ${isMealConfirmed(mealKey) ? "confirmed" : ""}`} key={index}>
                  <div className="meal-header">
                    <h3>Comida {index + 1}:</h3>
                    {!isMealConfirmed(mealKey) &&
                      <div className="meal-buttons">
                        <button onClick={() => handleConfirmMeal(meal, mealKey)}>Confirmar</button>
                        <button onClick={() => handleConfirmMeal(meal)}>Editar</button>
                      </div>
                    }
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
              ))}
            </ul>
          ) : (
            <p>No hay comidas para este día.</p>
          )}
        </>
      )}
    </div>
  );
};

export default DietDetails