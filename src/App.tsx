import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Workspace } from './pages/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing 首页 */}
        <Route path="/" element={<Landing />} />
        {/* 主工作区 */}
        <Route path="/algo/:id" element={<Workspace />} />
        {/* 默认路由 */}
        <Route path="*" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
