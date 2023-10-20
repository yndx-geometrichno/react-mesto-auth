import { useState } from "react";
import SignForm from "./SignForm";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log(email, password);
    onLogin(password, email);
  }

  return (
    <SignForm
      header="Вход"
      onSubmit={handleSubmit}
      setEmail={setEmail}
      setPassword={setPassword}
      buttonText="Войти"
    />
  );
}
