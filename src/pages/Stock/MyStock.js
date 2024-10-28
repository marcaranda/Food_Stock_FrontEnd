import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import DropDown from "../../components/DropDown";
import "../../styles/MyStock.css";
import Swal from 'sweetalert2';

function MyStock() {
  const navigate = useNavigate();

  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [booleanAddMeal, setBooleanAddMeal] = useState(false);

  const [stock, setStock] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        // Obtiene todos los registros de la tabla 'stock'
        const { data: stockData, error } = await supabase
            .from('stock')
            .select('*'); // Selecciona todas las columnas
    
        if (error) {
            throw error; // Lanza un error si la consulta falla
        }
    
        // Establece el estado con los datos obtenidos
        setStock(stockData);
      } catch (error) {
          console.error("Error al obtener el stock:", error);
      }
    }

    fetchStock();
  }, [stock]);

  const handleInputChange = (field, value) => {
    switch (field) {
      case "food":
        setFood(value);
        break;
      case "quantity":
        setQuantity(value);
        break;
      case "unit":
        setUnit(value);
        break;
      default:
        break;
    }
  };

  const handleInputUpdateChange = (index, value) => {
    const newStock = [...stock];
    newStock[index].quantity = value;
    setStock(newStock);
  }

  const handleSaveButton = async () => {
    const mealData = {
      food,
      quantity,
      unit,
    };

    setFood("");
    setQuantity("");
    setUnit("g");

    try {
      // Guarda el mealData en Supabase
      const { data, error } = await supabase
        .from('stock')
        .insert([mealData]);

      if (error) { 
        throw error;
      }

      Swal.fire({
        title: "Success!",
        text: "Comida guardada correctamente",
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al guardar la comida',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }

    setBooleanAddMeal(false);
  }

  const handleSaveUpdateButton = async (index) => {
    const food = stock[index];

    try {
      // Actualiza el registro en la tabla 'stock' con los datos de 'food'
      const { data, error } = await supabase
          .from('stock')
          .upsert([food]); // upsert inserta o actualiza según si existe el registro

      if (error) {
          throw error; // Lanza un error si la actualización falla
      }

      Swal.fire({
        title: "Success!",
        text: "Comida actualizada correctamente",
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al guardar la comida',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
}

  const handleDeleteButton = async (index) => {
    const food = stock[index];
    
    const newStock = [...stock];
    newStock.splice(index, 1);
    setStock(newStock);

    try {
      // Elimina el registro de la tabla 'stock' basado en el identificador único
      const { error } = await supabase
          .from('stock')
          .delete()
          .eq('id', food.id); // Asegúrate de que 'food' sea el campo que identifica el registro

      if (error) {
          throw error; // Lanza un error si la eliminación falla
      }

      Swal.fire({
        title: "Success!",
        text: "Comida eliminada correctamente",
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al eliminar la comida',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  return (
    <div className="container">
      <button className="home" onClick={() => navigate("/")}>Inicio</button>
      <h1>Mi Stock</h1>
      <button className="add-food" onClick={() => setBooleanAddMeal(true)}>Añadir Comida</button>

      {booleanAddMeal && (
        <div>
          <input
            type="text"
            placeholder="Alimento"
            onChange={(e) => handleInputChange("food", e.target.value)}
          />
          <input
            type="number"
            placeholder="Cantidad"
            onChange={(e) => handleInputChange("quantity", e.target.value)}
          />
          <DropDown
            options={[
              { value: 'g', label: 'Gramos (g)' },
              { value: 'u', label: 'Unidades (u)' },
            ]}
            predeterminated={{ value: 'g', label: 'Gramos (g)' }}
            onSelect={(selected) => handleInputChange("unit", selected.value)}
          />
          <button onClick={handleSaveButton}>Guardar</button>
        </div>
      )}

      <div>
        <h2 className="stock-title">Stock:</h2>
        {stock ? ( // Verifica si stock no es null
          <ul className="stock-list">
            {stock.map((food, i) => (
              <li className="stock-item" key={food.food}>
              <label htmlFor={`food-${food.food}`}>{food.food}: </label>
              <input
                id={`food-${food.food}`}
                type="number"
                value={food.quantity}
                onChange={(e) => handleInputUpdateChange(i, e.target.value)}
              />
              <span>{food.unit}</span>
              <button className="update" onClick={() => handleSaveUpdateButton(i)}>Actualizar</button>
              <button className="delete" onClick={() => handleDeleteButton(i)}>Eliminar</button>
            </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos en el stock.</p>
        )}
      </div>
    </div>
  );
}

export default MyStock