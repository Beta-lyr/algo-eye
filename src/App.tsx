import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Workspace } from './pages/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 主工作区 — 默认路由 */}
        <Route path="*" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
