import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import DeleteCardPopup from "./DeleteCardPopup";
import ContentLoading from "./ContentLoading";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import Login from "./Login";
import InfoTooltip from "./InfoTooltip";
import { api } from "../utils/Api";
import { register, authorize, checkToken } from "../utils/auth";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { AppContext } from "../contexts/AppContext";

function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setDeleteCardPopupOpen] = useState(false);
  const [isInfoTooltipPopupOpen, setInfoTooltipPopupOpen] = useState(false);
  const [isContentLoading, setContentLoading] = useState(true);
  const [isSubmitLoading, setSubmitLoading] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [cardToDelete, setCardToDelete] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState({});
  const [userEmail, setUserEmail] = useState("");
  const [infoTooltipMessage, setInfoTooltipMessage] = useState("");

  const navigate = useNavigate();

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
    if (localStorage.getItem("jwt")) {
      let jwt = localStorage.getItem("jwt");
      checkToken(jwt)
        .then((res) => {
          setUserEmail(res.data.email);
          setLoggedIn(true);
          navigate("/", { replace: true });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      navigate('/sign-in')
    }
  }, [navigate]);

  function handleSubmit(request) {
    setSubmitLoading(true);
    request()
      .then(closeAllPopups)
      .catch(console.error)
      .finally(() => {
        setTimeout(setSubmitLoading, 1000, false);
      });
  }

  function closeAllPopups() {
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setDeleteCardPopupOpen(false);
    setInfoTooltipPopupOpen(false);
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
      return api
        .addNewCard(inputValues)
        .then((newCard) => {
          setCards([newCard, ...cards]);
        })
    }

    handleSubmit(makeRequest);
  }

  function handleDeleteCardClick(card) {
    setDeleteCardPopupOpen(true);
    setCardToDelete(card);
  }

  function handleDeleteCardSubmit() {
    function makeRequest() {
      return api
        .deleteCard(cardToDelete._id)
        .then(() => {
          setCards((state) =>
            state.filter((c) => c._id !== cardToDelete._id && c)
          );
        })
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
      return api
        .updateUserInfo(inputValues)
        .then(setCurrentUser)
    }

    handleSubmit(makeRequset);
  }

  function onLogin(password, email) {
    authorize(password, email)
      .then((res) => {
        if (res.token) {
          navigate("/", { replace: true });
          setUserEmail(email);
          setLoggedIn(true);
        }
      })
      .catch((err) => {
        handleInfoToooltipPopup(err);
      });
  }

  function handleInfoToooltipPopup(message) {
    setInfoTooltipMessage(message);
    setInfoTooltipPopupOpen(true);
  }

  function onRegister(password, email) {
    register(password, email)
      .then((res) => {
        if (!res.password) {
          throw new Error("");
        }
        navigate("/sign-in", { replace: true });
      })
      .catch((err) => {
        handleInfoToooltipPopup(err);
      })
      .finally(() => {
        setInfoTooltipPopupOpen(true);
      })
  }

  function onSignOut() {
    localStorage.removeItem("jwt");
    setLoggedIn(false);
    setUserEmail("");
  }

  return (
    <AppContext.Provider
      value={{
        isSubmitLoading,
        isLoggedIn,
        userEmail,
        setUserEmail,
        onClose: closeAllPopups,
      }}
    >
      <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
          <div className="page__container">
            <Header onSignOut={onSignOut} />
            {isContentLoading ? (
              <ContentLoading />
            ) : (
              <Routes>
                <Route
                  path="/sign-up"
                  element={
                    <Register
                      onRegister={onRegister}
                      setInfoTooltipPopupOpen={setInfoTooltipPopupOpen}
                    />
                  }
                />
                <Route path="/sign-in" element={<Login onLogin={onLogin} />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute
                      onEditProfile={handleEditProfileClick}
                      onAddPlace={handleAddPlaceClick}
                      onEditAvatar={handleEditAvatarClick}
                      onCardClick={handleCardClick}
                      onCardLike={handleCardLike}
                      onCardDelete={handleDeleteCardClick}
                      cards={cards}
                      element={Main}
                    />
                  }
                />
              </Routes>
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
          <InfoTooltip
            isOpen={isInfoTooltipPopupOpen}
            message={infoTooltipMessage}
          />
        </div>
      </CurrentUserContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
