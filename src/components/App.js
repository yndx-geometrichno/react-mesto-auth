import { useState, useEffect } from "react";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import { api } from "../utils/Api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { AppContext } from "../contexts/AppContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import DeleteCardPopup from "./DeleteCardPopup";
import ContentLoading from "./ContentLoading";

function App() {
  const [isContentLoading, setContentLoading] = useState(true);
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setDeleteCardPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [cardToDelete, setCardToDelete] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState({});

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userInfoFromServer, initialCardsFromServer]) => {
        setCurrentUser(userInfoFromServer);
        const cardArray = Object.values(initialCardsFromServer);
        setCards(cardArray);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setContentLoading(false);
      });
  }, []);

  function handleSubmit(request) {
    setIsLoading(true);
    request()
      .then(closeAllPopups)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }

  function closeAllPopups() {
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setDeleteCardPopupOpen(false);
    setSelectedCard({});
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true);
  }

  function handleCardSubmit(inputValues) {
    function makeRequest() {
      return api.addNewCard(inputValues).then((newCard) => {
        setCards([newCard, ...cards]);
      });
    }

    handleSubmit(makeRequest);
  }

  function handleDeleteCardClick(card) {
    setDeleteCardPopupOpen(true);
    setCardToDelete(card);
  }

  function handleDeleteCardSubmit() {
    function makeRequest() {
      return api.deleteCard(cardToDelete._id).then(() => {
        setCards((state) =>
          state.filter((c) => c._id !== cardToDelete._id && c)
        );
      });
    }

    handleSubmit(makeRequest);
  }

  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true);
  }

  function handleAvatarSubmit(inputValues) {
    function makeRequest() {
      return api.updateAvatar(inputValues).then(setCurrentUser);
    }

    handleSubmit(makeRequest);
  }

  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }

  function handleProfileSubmit(inputValues) {
    function makeRequset() {
      return api.updateUserInfo(inputValues).then(setCurrentUser);
    }

    handleSubmit(makeRequset);
  }

  return (
    <AppContext.Provider value={{ isLoading, onClose: closeAllPopups }}>
      <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
          <div className="page__container">
            <Header />
            {isContentLoading ? (
              <ContentLoading />
            ) : (
              <Main
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onEditAvatar={handleEditAvatarClick}
                onCardClick={handleCardClick}
                onCardLike={handleCardLike}
                onCardDelete={handleDeleteCardClick}
                cards={cards}
              />
            )}
            <Footer />
          </div>
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onUpdateUser={handleProfileSubmit}
          />
          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onSubmitCard={handleCardSubmit}
          />
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onUpdateAvatar={handleAvatarSubmit}
          />
          <DeleteCardPopup
            isOpen={isDeleteCardPopupOpen}
            onCardDelete={handleDeleteCardSubmit}
          />
          <ImagePopup card={selectedCard} />
        </div>
      </CurrentUserContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
