import React from "react";
import "../styles/WeekCalendar.css";
import { useSortable } from '@dnd-kit/sortable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListDots } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem } from "@mui/material";

function SortableItem({ diet, index, navigate, handleShowOptionsDiet, handleCloseOptionsDiet, anchorEl, setAnchorEl }) {
  const {
    attributes,
    listeners,
    setNodeRef,
  } = useSortable({ id: diet.name });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners} // Permite arrastrar en toda el área
      className="diet-item"
      key={index}
    >
            <button onClick={() => navigate(`/myDiets/${diet.name}`)}>{diet.name}</button>
            <button onClick={handleShowOptionsDiet}
            >
              <FontAwesomeIcon icon={faListDots} />
            </button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={(event) => handleCloseOptionsDiet(event, diet.name)}>Editar</MenuItem>
        <MenuItem onClick={(event) => handleCloseOptionsDiet(event, diet.name)}>Eliminar</MenuItem>
      </Menu>
    </li>
  );
}

export default SortableItem;