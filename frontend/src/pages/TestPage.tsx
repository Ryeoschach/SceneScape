import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div style={{ border: '4px dashed #6366f1', padding: '20px', height: '200vh', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
      <h1 className="text-2xl font-bold mb-4">测试页面</h1>
      <p>此页面用于调试布局。</p>
      <p>它有很长的内容来测试滚动。</p>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">测试链接：</h2>
        <ul className="space-y-2">
          <li>
            <Link to="/movies/1" className="text-blue-600 hover:underline">
              电影详情 - 盗梦空间 (ID: 1)
            </Link>
          </li>
          <li>
            <Link to="/movies/2" className="text-blue-600 hover:underline">
              电影详情 - 黑客帝国 (ID: 2)
            </Link>
          </li>
          <li>
            <Link to="/tv-shows/2" className="text-blue-600 hover:underline">
              电视剧详情 (ID: 2)
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
