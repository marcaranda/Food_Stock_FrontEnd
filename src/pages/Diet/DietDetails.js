import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { supabase } from "../../supabaseClient";
import DropDown from "../../components/DropDown";

function DietDetails() {
  const navigate = useNavigate();
  const { dietId } = useParams();
  const [diet, setDiet] = useState(null);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
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
        // Obtener la dieta específica
        const { data: daysData, error: daysError } = await supabase
          .from('days')
          .select('id, day_number, meals(id)')
          .eq('diet_id', dietId);

        if (daysError) throw daysError;

        const dietArray = [];

        // Paso 2: Iterar sobre los días obtenidos
        for (const day of daysData) {
          const dayMealsArray = [];

          // Paso 3: Obtener las comidas de cada día
          const { data: mealsData, error: mealsError } = await supabase
            .from('meals')
            .select('id, meal_type, ingredients(id, food_id, quantity, unit)')
            .eq('day_id', day.id);

          if (mealsError) throw mealsError;

          // Paso 4: Iterar sobre las comidas del día
          for (const meal of mealsData) {
            const ingredientsArray = [];

            // Paso 5: Obtener los ingredientes de cada comida
            for (const ingredient of meal.ingredients) {
              const { data: foodData, error: foodError } = await supabase
                .from('foods')
                .select('food')
                .eq('id', ingredient.food_id)
                .single();

              if (foodError) throw foodError;

              // Añadir el ingrediente al array de ingredientes
              ingredientsArray.push({
                food: foodData.food,
                quantity: ingredient.quantity,
                unit: ingredient.unit
              });
            }

            // Añadir la comida con sus ingredientes al array del día
            dayMealsArray.push({
              type: meal.meal_type,
              ingredients: ingredientsArray
            });
          }

          // Añadir el día con sus comidas al array de la dieta
          dietArray.push({
            day_number: day.day_number,
            meals: dayMealsArray
          });
        }

        console.log('Diet:', dietArray); 
        setDiet(dietArray);
      } catch (error) {
        console.error('Error fetching diet:', error);
      } finally {
        setLoading(false); // Establece la carga a false al finalizar
      }
    };

    fetchDiet();
  }, [dietId]);

  const handleDayChange = (value) => {
    setDay(parseInt(value));

    // Aquí puedes hacer algo con el día seleccionado
  }

  const handleConfirmMeal = (meal) => {
    console.log('Meal confirmed:', meal);

    /*for (const ingredient of meal.ingredients) {
      let food = stock.find(item => item.food === ingredient.food);
      food.quantity -= parseFloat(ingredient.quantity);

      if (food.quantity <= 0) {
        deleteFoodStock(food);
      }
      else {
        saveFoodStock(food);
      }
    }*/
  }

  const deleteFoodStock = async (food) => {
    /*try {
      const foodDocRef = doc(db, "stock", food.food);
      await deleteDoc(foodDocRef);
      console.log(`Food ${food.food} deleted from stock`);
    } catch (error) {
        console.error("Error deleting food from stock:", error);
    }*/
  }

  const saveFoodStock = async (food) => {
    /*try {
      await setDoc(doc(db, "stock", food.food), food, { merge: true });

      console.log(`Food ${food.food} updated in stock`);
    } catch (error) {
        console.error("Error saving food in stock:", error);
    }*/
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!diet) {
    return <div>Diet not found!</div>;
  }

  const selectedDayMeals = diet.find(d => d.day_number === day);
  const showTotalFood = day === 8;

  return (
    <div>
      <button onClick={() => navigate("/")}>Inicio</button>
      <button onClick={() => navigate("/myDiets")}>Volver</button>
      <h1>{diet.dietName}</h1>

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
      />

      {showTotalFood ? (
        <div>
          <h2>Total de Alimentos:</h2>
          <ul>
            {Object.entries(diet.totalFood).map(([food, { quantity, unit }]) => (
              <li key={food}>
                {food}: {quantity} {unit}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <h2>Comidas del {dayToLabelMap[day]}:</h2>
          {selectedDayMeals ? (
            <ul>
              {selectedDayMeals.meals.map((meal, index) => (
                <li key={index}>
                  <h3>Comida {index + 1}:</h3>
                  <button onClick={() => handleConfirmMeal(meal)}>Confirmar</button>
                  <ul>
                    {meal.ingredients.map((ingredient, i) => (
                      <li key={i}>
                        {ingredient.food}: {ingredient.quantity} {ingredient.unit}
                      </li>
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