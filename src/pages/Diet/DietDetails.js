import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import DropDown from "../../components/DropDown";

import { db } from "../../firebase";
import { doc, getDoc, getDocs, collection, deleteDoc, setDoc } from "firebase/firestore";

function DietDetails() {
  const navigate = useNavigate();
  const { dietId } = useParams();
  const [diet, setDiet] = useState(null);
  const [stock, setStock] = useState(null);
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
        const dietDocRef = doc(db, 'diets', dietId); // Referencia al documento con el ID de la URL
        const dietDoc = await getDoc(dietDocRef);
        
        if (dietDoc.exists()) {
          setDiet(dietDoc.data()); // Almacena los datos de la dieta si existen
        } else {
          console.error('No such document!');
        }

        const stockCollectionRef = collection(db, 'stock');
        const querySnapshot = await getDocs(stockCollectionRef);
        const stockData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        setStock(stockData);

      } catch (error) {
        console.error('Error fetching diet:', error);
      } finally {
        setLoading(false);
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

    for (const ingredient of meal.ingredients) {
      let food = stock.find(item => item.data.food === ingredient.food);
      food.data.quantity -= parseFloat(ingredient.quantity);

      if (food.data.quantity <= 0) {
        deleteFoodStock(food);
      }
      else {
        saveFoodStock(food);
      }
    }
  }

  const deleteFoodStock = async (food) => {
    try {
      const foodDocRef = doc(db, "stock", food.id); // asume que 'food.food' es el ID del documento
      await deleteDoc(foodDocRef);
      console.log(`Food ${food.data.food} deleted from stock`);
    } catch (error) {
        console.error("Error deleting food from stock:", error);
    }
  }

  const saveFoodStock = async (food) => {
    try {
      const foodDocRef = doc(db, "stock", food.id); // asume que 'food.food' es el ID del documento

      // Se usa `setDoc` para sobrescribir o crear el documento si no existe
      await setDoc(foodDocRef, {
          food: food.data.food,
          unit: food.data.unit,
          quantity: food.data.quantity
      }, { merge: true }); // merge: true asegura que no se sobrescriban campos innecesarios

      console.log(`Food ${food.data.food} updated in stock`);
    } catch (error) {
        console.error("Error saving food in stock:", error);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!diet) {
    return <div>Diet not found!</div>;
  }

  const selectedDayMeals = diet.days.find(d => d.day === day);
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