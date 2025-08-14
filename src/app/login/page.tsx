"use client";
import { useState } from "react";

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const params = new URLSearchParams();
    params.set("callbackUrl", "/");
    params.set("redirect", "false");
    params.set("nickname", nickname);
    params.set("password", password);
    const res = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (res.ok) location.href = "/";
    else alert("Неверные данные");
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold">Вход</h1>
      <input className="w-full border p-2 rounded" placeholder="Nickname" value={nickname} onChange={e=>setNickname(e.target.value)} />
      <input className="w-full border p-2 rounded" type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">Войти</button>
    </div>
  );
}
