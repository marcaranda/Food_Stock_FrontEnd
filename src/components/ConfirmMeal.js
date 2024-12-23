import { useState } from 'react';
import DropDown from './DropDown';
import "../styles/components/ConfirmMeal.css";

function ConfirmMeal({ dietName, meal, mealKey, setShowConfirmMeal }) {
  const [mealData, setMealData] = useState({ ...meal });

  const handleInputChange = (key, value) => {
    console.log(key, value);
  }

  const handleConfirmMeal = () => {

  }

  const handleAddIngredient = () => {
    const index = Object.keys(mealData[0]).length;
    const ingredientKey = `alimento${index + 1}`;
    
    const newMealData = {...mealData}
    newMealData[0][ingredientKey] = { name: "", quantity: "", unit: "g" }
    setMealData(newMealData);
    console.log(newMealData);
  };

  const handleDeleteIngredient = (i, j) => {
    console.log(mealData);
  }

  const handleCloseModal = () => {
    setShowConfirmMeal(false);
    console.log(meal);
    setMealData(meal);
  }

  return (
    <div className='modal-body'>
      <div className='modal-container'>
        <div className='modal-header'>
          <h2>Confirmar Comida</h2>
        </div>

        <div className='modal-content'>
          <h4>Alimentos:</h4>
          <button onClick={() => handleAddIngredient()}>Añadir Alimento</button>
          <ul className="ingredient-list">
            {meal.map((ingredientObject, i) => (
              Object.entries(ingredientObject).map(([ingredientKey, ingredient], j) => (
                <div key={`${i}-${j}`} className="ingredient-container">
                <input
                  type="text"
                  placeholder="Alimento"
                  value={ingredient.name}
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
              ))
            ))}
          </ul>
        </div>

        <div className="modal-buttons">
          <button className="confirm-button" onClick={() => handleConfirmMeal()}>Confirmar</button>
          <button className="cancel-button" onClick={() => handleCloseModal()}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmMeal;