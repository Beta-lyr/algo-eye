import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Workspace } from './pages/Workspace';
import { Learn } from './pages/Learn';
import { About } from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing 首页 */}
        <Route path="/" element={<Landing />} />
        {/* 主工作区 */}
        <Route path="/algo/:id" element={<Workspace />} />
        {/* 算法讲解页面 */}
        <Route path="/algo/:id/learn" element={<Learn />} />
        {/* 关于页面 */}
        <Route path="/about" element={<About />} />
        {/* 默认路由 */}
        <Route path="*" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
