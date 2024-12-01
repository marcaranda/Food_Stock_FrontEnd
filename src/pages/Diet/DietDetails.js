import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { getUrl } from "../../data/Constants";
import DropDown from "../../components/DropDown";
import Swal from 'sweetalert2';
import axios from "axios";
import "../../styles/DietDetails.css";

function DietDetails() {
  const navigate = useNavigate();
  const url = getUrl();
  const { dietName } = useParams();
  const [diet, setDiet] = useState([]);
  const [totalFood, setTotalFood] = useState([]);
  const [day, setDay] = useState(new Date().getDay());

  const dayToLabelMap = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    0: 'Domingo',
  };

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const decodedDietName = decodeURIComponent(dietName);

        // Obtener la dieta específica
        axios.get(`${url}diet/${decodedDietName}`)
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
    // eslint-disable-next-line
  }, []);

  const handleDayChange = (value) => {
    setDay(parseInt(value));
  }

  const handleConfirmMeal = (meal) => {
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
  }

  const handleEditMeal = (meal) => {
    console.log(meal);
  }

  const showTotalFood = day === 8;
  let dayLabel = null;
  let dayKey = null;
  let selectedDayMeals = null;

  if (!showTotalFood) {
    dayLabel = dayToLabelMap[day];
    dayKey = dayLabel.toLowerCase();
    selectedDayMeals = diet[dayKey];
  }

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate("/")}>Inicio</button>
        <button onClick={() => navigate("/myDiets")}>Volver</button>
      </div>

      <h1>{dietName}</h1>

      <DropDown
        options={[
          { value: '1', label: 'Lunes' },
          { value: '2', label: 'Martes' },
          { value: '3', label: 'Miércoles' },
          { value: '4', label: 'Jueves' },
          { value: '5', label: 'Viernes' },
          { value: '6', label: 'Sábado' },
          { value: '0', label: 'Domingo' },
          { value: '8', label: 'Todos los días' },
        ]}
        predeterminated={{ value: day, label: dayToLabelMap[day] }}
        onSelect={(selected) => handleDayChange(selected.value)}
        boolDays={false}
      />

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
          <h2>Comidas del {dayLabel}:</h2>
          {selectedDayMeals ? (
            <ul className="meal-list">
              {Object.entries(selectedDayMeals).map(([mealKey, meal], index) => (
                <li className="meal-item" key={index}>
                  <div className="meal-header">
                    <h3>Comida {index + 1}:</h3>
                    <div className="meal-buttons">
                      <button onClick={() => handleConfirmMeal(meal)}>Confirmar</button>
                      <button onClick={() => handleConfirmMeal(meal)}>Editar</button>
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