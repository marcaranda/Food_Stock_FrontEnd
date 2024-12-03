import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../data/Constants";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "../../components/SortableItem";
import Swal from 'sweetalert2';
import axios from "axios";
import "../../styles/MyDiets.css";

function MyDiets() {
  const navigate = useNavigate();
  const url = getUrl();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        axios.get(`${url}diet`)
          .then((response) => {
            const dietsData = response.data.diets;
            setDiets(dietsData); // Guarda los datos de las dietas en el estado
            const dietNamesList = dietsData.map(diet => diet.name); // Suponiendo que la columna se llama 'diet_name'
            setDietNames(dietNamesList); // Guarda los nombres de las dietas en el estado
          })
      } catch (error) {
        console.error("Error al obtener los nombres de las dietas:", error);
      }
    };

    fetchDietNames(); // Ejecuta la función cuando se carga el componente
    // eslint-disable-next-line
  }, []);

  const handleShowOptionsDiet = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleCloseOptionsDiet = (event, dietname) => {
    setAnchorEl(null);

    switch (event.target.innerText) {
      case "Editar":
        console.log("Editar dieta");
        break;
      case "Eliminar":
        try { 
        axios.delete(`${url}diet/${dietname}`)
        .then(() => {
          const updatedDiets = diets.filter(diet => diet.name !== dietname);
          setDiets(updatedDiets);
          const updatedDietNames = dietNames.filter(name => name !== dietname);
          setDietNames(updatedDietNames);

          Swal.fire({
            title: "Success!",
            text: "Dieta eliminada correctamente",
            icon: "success"
          });
        });
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Error al eliminar la dieta',
            icon: 'error',
            confirmButtonText: 'Cool'
          });
        }
        break;
      default:
        break;
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setDiets((prev) => {
        const oldIndex = prev.findIndex((diet) => diet.name === active.id);
        const newIndex = prev.findIndex((diet) => diet.name === over.id);

        console.log(newIndex);

        try {
          axios.put(`${url}diet/changeOrder?dietName=${active.id}&newOrder=${newIndex + 1}`,)

          const updated = [...prev];
            const [moved] = updated.splice(oldIndex, 1);
            updated.splice(newIndex, 0, moved);

            return updated;
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Error al reordenar las dietas',
            icon: 'error',
            confirmButtonText: 'Cool'
          });
        }

      });
    }
  };

  return (
    <div className="container">
      <div className="header">
      <button onClick={() => navigate("/")}>Inicio</button>
      <button onClick={() => navigate("/addDiet")}>Añadir Dieta</button>
      </div>
      <h1>Mis Dietas</h1>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={diets.map((diet) => diet.name)} strategy={verticalListSortingStrategy}>
          <ul className="diet-list">
            {diets.map((diet, index) => (
              <SortableItem
              key={diet.name}
              diet={diet}
              index={index}
              navigate={navigate}
              handleShowOptionsDiet={handleShowOptionsDiet}
              handleCloseOptionsDiet={handleCloseOptionsDiet}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
            />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default MyDiets