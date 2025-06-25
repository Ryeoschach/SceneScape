import React from 'react';
import { Link } from 'react-router-dom';

const DetailTestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        详细页面测试
      </h1>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">电视剧详细页面</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link 
            to="/tv-shows/1" 
            className="block p-4 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="font-medium">绝命毒师 (ID: 1)</div>
            <div className="text-sm text-slate-500">Breaking Bad</div>
          </Link>
          <Link 
            to="/tv-shows/2" 
            className="block p-4 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="font-medium">权力的游戏 (ID: 2)</div>
            <div className="text-sm text-slate-500">Game of Thrones</div>
          </Link>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">电影详细页面</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/movies/1" 
            className="block p-4 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="font-medium">盗梦空间 (ID: 1)</div>
            <div className="text-sm text-slate-500">Inception (2010)</div>
          </Link>
          <Link 
            to="/movies/2" 
            className="block p-4 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="font-medium">测试电影 2 (ID: 2)</div>
            <div className="text-sm text-slate-500">如果存在的话</div>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="mb-2"><strong>测试步骤：</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>点击上面的链接测试详细页面</li>
              <li>检查页面是否正确显示数据</li>
              <li>验证返回按钮是否工作</li>
              <li>检查图片是否能正常加载</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTestPage;
