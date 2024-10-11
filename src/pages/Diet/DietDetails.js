import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

function DietDetails() {
  const navigate = useNavigate();
  const { dietId } = useParams();
  const [diet, setDiet] = useState(null); // Almacena los datos de la dieta
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga

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
      } catch (error) {
        console.error('Error fetching diet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiet();
  }, [dietId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!diet) {
    return <div>Diet not found!</div>;
  }

  return (
    <div>
      <button onClick={() => navigate("/myDiets")}>Volver</button>
      <h1>{diet.dietName}</h1>
      <h2>Meals:</h2>
      <ul>
        {diet.meals.map((meal, index) => (
          <li key={index}>
            <h3>Meal {index + 1}:</h3>
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
    </div>
  );
};

export default DietDetails