import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faList } from "@fortawesome/free-solid-svg-icons";
import { useParams } from 'react-router-dom';
import { getUrl } from "../../data/Constants";
import { format, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import WeekCalendar from "../../components/WeekCalendar";
import Navbar from "../../components/Navbar";
import MealList from "../../components/MealList";
import Swal from 'sweetalert2';
import Calendar from 'react-calendar';
import axios from "axios";
import "../../styles/pages/DietDetails.css";
import 'react-calendar/dist/Calendar.css';

function DietDetails() {
  const url = getUrl();
  const actualDate = new Date();
  const { dietName } = useParams();
  const [diet, setDiet] = useState([]);
  const [selectedDayMeals, setSelectedDayMeals] = useState([]);
  const [totalFood, setTotalFood] = useState([]);
  const [showTotalFood, setShowTotalFood] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [mealsConfirmed, setMealsConfirmed] = useState([]);

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
    return mealsConfirmed.some(meal => meal.meal.hasOwnProperty(mealKey));
  }

  return (
    <div className="container">
      <div className="header">
        <Navbar />
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
          <MealList
          dietName={dietName}
          calendarDate={calendarDate}
          showEditButton={true}
          />
        </>
      )}
    </div>
  );
};

export default DietDetails