import React from "react";

export default function SignForm({
  header,
  buttonText,
  children,
  onSubmit,
  setEmail,
  setPassword,
}) {
  return (
    <div className="sign__container">
      <h2 className="sign__header">{header}</h2>
      <form className="sign__form form_type_login" onSubmit={onSubmit}>
        <input
          type="email"
          className="sign__form-input"
          placeholder="Email"
          onChange={({ target }) => setEmail(target.value)}
        ></input>
        <input
          type="password"
          className="sign__form-input"
          placeholder="Пароль"
          onChange={({ target }) => setPassword(target.value)}
        ></input>
        <button className="sign__button" type="submit">
          {buttonText}
        </button>
      </form>
      {children}
    </div>
  );
}
