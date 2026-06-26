import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';

// 页面组件 - 后续实现
// import Landing from './pages/Landing';
// import Workspace from './pages/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 后续添加路由 */}
        {/* <Route path="/" element={<Landing />} /> */}
        {/* <Route path="/algo/:id" element={<Workspace />} /> */}

        {/* 临时占位 */}
        <Route path="*" element={<div>Algo Eye - 基础架构已就绪</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
