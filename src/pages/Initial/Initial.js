import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faList, faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { getUrl } from "../../data/Constants";
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import WeekCalendar from "../../components/WeekCalendar";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import "../../styles/Initial.css";
import axios from "axios";

function Initial() {
  const url = getUrl();
  const actualDate = new Date();
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMeals, setShowMeals] = useState(false);
  const [showTrainings, setShowTrainings] = useState(false);
  const [diet, setDiet] = useState([]);
  const [selectedDayMeals, setSelectedDayMeals] = useState([]);
  const [mealsConfirmed, setMealsConfirmed] = useState([]);

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        await axios.get(`${url}diet/favorite/true`)
          .then((response) => {
            setDiet(response.data.diet.days);
          });        
      } catch (error) {
        console.error('Error fetching diet:', error);
      }
    };

    fetchDiet();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getDayMeals(new Date());
    // eslint-disable-next-line
  }, [diet]);
  
  useEffect(() => {
    const getConfirmedMeals = async () => {
      try {
        const dateFormatted = format(calendarDate, 'yyyy-MM-dd');

        await axios.get(`${url}meal/${dateFormatted}`)
          .then((response) => {
            setMealsConfirmed(response.data.meal.meals);
          });
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    };

    getConfirmedMeals();
    // eslint-disable-next-line
  }, [calendarDate]);

  const handleShowCalendarClick = () => {
    setShowCalendar(prevShowCalendar => !prevShowCalendar);
  }

  const handleShowMealsClick = () => {
    setShowMeals(prevShowMeals => !prevShowMeals);
  }

  const handleShowTrainingsClick = () => {
    setShowTrainings(prevShowTrainings => !prevShowTrainings);
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
    return mealsConfirmed.some(meal => meal.meal.hasOwnProperty(mealKey));
  }

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

        const confirmedMeal = {
          [mealKey]: meal
        }

        axios.put(`${url}meal`, {
          date: format(calendarDate, 'yyyy-MM-dd'),
          meal: confirmedMeal,
        });

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
        text: 'No puedes confirmar una comida que no es de hoy',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  return (
    <div className="container">
      <Navbar />
      <div className="home-container">
        <h1>Initial page</h1>
        
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
      </div>

      <div className="list-container">
        <div className="list-title-container" onClick={handleShowMealsClick}>
          <h2>Comidas</h2>
          <button>
            {showMeals ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
          </button>
        </div>
        {showMeals && (
          selectedDayMeals ? (
            <ul className="meal-list">
              {Object.entries(selectedDayMeals).map(([mealKey, meal], index) => (
                <li className={`meal-item ${isMealConfirmed(mealKey) ? "confirmed" : ""}`} key={index}>
                  <div className="meal-header">
                    <h3>Comida {index + 1}:</h3>
                    {!isMealConfirmed(mealKey) &&
                      <div className="meal-buttons">
                        <button onClick={() => handleConfirmMeal(meal, mealKey)}>Confirmar</button>
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
          )
        )}
      </div>
      <div className="list-container">
        <div className="list-title-container" onClick={handleShowTrainingsClick}>
          <h2>Entrenos</h2>
          <button>
            {showTrainings ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
          </button>
        </div>
      </div>

      </div>
    </div>
  );
}

export default Initial