import {useContext} from "react";
import PopupWithForm from "./PopupWithForm";
import { AppContext } from "../contexts/AppContext";

export default function DeleteCardPopup({ isOpen, onCardDelete }) {
  const appContext = useContext(AppContext);

  function handleSubmit(e) {
    e.preventDefault();
    onCardDelete();
  }

  return (
    <PopupWithForm
      name="delete-card-confirmation"
      title="Вы уверены?"
      buttonText={appContext.isLoading ? "Удаление..." : "Да"}
      onSubmit={handleSubmit}
      isOpen={isOpen}
      isValid={true}
    />
  );
}
