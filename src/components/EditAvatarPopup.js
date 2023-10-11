import { useContext, useEffect } from "react";
import PopupWithForm from "./PopupWithForm";
import { AppContext } from "../contexts/AppContext";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "./Input";
import { avatar_validation } from "../utils/inputValidations";

export default function EditAvatarPopup({ isOpen, onUpdateAvatar }) {
  const appContext = useContext(AppContext);

  const methods = useForm({ mode: "all" });

  const formState = methods.formState;

  const onSubmit = methods.handleSubmit((data) => {
    onUpdateAvatar(data);
  });

  useEffect(() => {
    formState.isSubmitted && methods.reset();
  }, [isOpen, formState.isSubmitted]);

  return (
    <FormProvider {...methods}>
      <PopupWithForm
        name="profile-pic-update"
        title="Обновить аватар"
        isOpen={isOpen}
        onSubmit={(e) => e.preventDefault()}
        buttonText={appContext.isLoading ? "Сохранение..." : "Сохранить"}
        isValid={formState.isValid}
        onClick={onSubmit}
      >
        <Input {...avatar_validation} />
      </PopupWithForm>
    </FormProvider>
  );
}
