import { Link, Route, Routes } from "react-router-dom";
import { ChatWidget } from "./components/ChatWidget";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <>
      <header className="topbar">
        <h1>ALLCTP 顾问系统</h1>
        <nav>
          <Link to="/">主页</Link> | <Link to="/admin">管理后台</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<main className="container">欢迎来到 allctp.com 在线咨询平台。</main>} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <ChatWidget />
    </>
  );
}
