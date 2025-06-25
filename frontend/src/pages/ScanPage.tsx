import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { ScanStatus } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

interface ScanHistoryTask {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  path: string;
  total_files: number;
  processed_files: number;
  progress: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

interface ScanHistoryProps {
  tasks: ScanHistoryTask[];
  onRefresh: () => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ tasks, onRefresh }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'running':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          扫描历史
        </h2>
        <button
          onClick={onRefresh}
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          🔄 刷新
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          暂无扫描记录
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
                  >
                    {getStatusText(task.status)}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    ID: {task.id}
                  </span>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(task.created_at).toLocaleString()}
                </div>
              </div>

              <div className="mb-2">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                  扫描路径
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {task.path}
                </div>
              </div>

              {task.total_files > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">进度</span>
                    <span className="text-slate-900 dark:text-slate-100">
                      {task.processed_files} / {task.total_files} ({task.progress.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {task.error_message && (
                <div className="mt-2">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                    错误信息
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                    {task.error_message}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ScanPage: React.FC = () => {
  const [scanPath, setScanPath] = useState('');
  const [recursive, setRecursive] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ScanStatus | null>(null);
  const [scanHistory] = useState<ScanHistoryTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 轮询当前任务状态
  const pollTaskStatus = async (taskId: string) => {
    try {
      const status = await apiService.getScanStatus(taskId);
      setCurrentStatus(status);

      if (status.status === 'completed' || status.status === 'failed') {
        setIsScanning(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        if (status.status === 'completed') {
          setSuccess(`扫描完成！处理了 ${status.processed_files} 个文件`);
        } else if (status.status === 'failed') {
          setError(`扫描失败: ${status.error_message}`);
        }
      }
    } catch (err) {
      console.error('轮询任务状态失败:', err);
    }
  };

  // 加载扫描历史
  const loadScanHistory = async () => {
    // TODO: 实现获取扫描历史的功能
    console.log('Loading scan history...');
  };

  // 开始扫描
  const handleStartScan = async () => {
    if (!scanPath.trim()) {
      setError('请输入扫描路径');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsScanning(true);

    try {
      const response = await apiService.startScan({
        path: scanPath.trim()
      });

      if (response.message) {
        setSuccess(response.message);
      }
      
      // 开始轮询任务状态
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      
      if (response.data?.task_id) {
        pollIntervalRef.current = setInterval(() => {
          pollTaskStatus(response.data!.task_id);
        }, 1000);
      }

    } catch (err: any) {
      setError(err.message || '启动扫描失败');
      setIsScanning(false);
    }
  };

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // 页面加载时获取历史记录
  useEffect(() => {
    loadScanHistory();
  }, []);

  const commonPaths = [
    '/Users/Movies',
    '/Users/TV Shows',
    '/Volumes/Media/Movies',
    '/Volumes/Media/TV',
    'D:\\Movies',
    'D:\\TV Shows',
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          媒体库扫描
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          扫描您的媒体文件夹，自动识别并添加电影和电视剧到媒体库中
        </p>
      </div>

      {/* 扫描表单 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          新建扫描任务
        </h2>

        <div className="space-y-4">
          {/* 扫描路径 */}
          <div>
            <label htmlFor="scanPath" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              扫描路径
            </label>
            <input
              id="scanPath"
              type="text"
              value={scanPath}
              onChange={(e) => setScanPath(e.target.value)}
              placeholder="请输入要扫描的文件夹路径，例如: /Users/Movies"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isScanning}
            />
          </div>

          {/* 常用路径快捷选择 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              常用路径
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonPaths.map((path) => (
                <button
                  key={path}
                  onClick={() => setScanPath(path)}
                  className="text-left px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  disabled={isScanning}
                >
                  {path}
                </button>
              ))}
            </div>
          </div>

          {/* 递归扫描选项 */}
          <div className="flex items-center">
            <input
              id="recursive"
              type="checkbox"
              checked={recursive}
              onChange={(e) => setRecursive(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-600 rounded"
              disabled={isScanning}
            />
            <label htmlFor="recursive" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              递归扫描子文件夹
            </label>
          </div>

          {/* 扫描按钮 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleStartScan}
              disabled={isScanning || !scanPath.trim()}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isScanning ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  扫描中...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  开始扫描
                </>
              )}
            </button>

            {isScanning && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                正在扫描，请稍候...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 当前任务状态 */}
      {currentStatus && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            当前扫描任务
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">状态:</span>
              <span className="text-sm font-mono text-slate-900 dark:text-slate-100">{currentStatus.status}</span>
            </div>

            {currentStatus.current_file && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">当前文件:</span>
                <span className="text-sm font-mono text-slate-900 dark:text-slate-100">{currentStatus.current_file}</span>
              </div>
            )}

            {currentStatus.total_files && currentStatus.total_files > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">扫描进度</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {currentStatus.processed_files || 0} / {currentStatus.total_files} 
                    ({currentStatus.progress.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${currentStatus.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 消息提示 */}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {success && (
        <Alert type="success" message={success} className="mb-6" />
      )}

      {/* 扫描历史 */}
      <ScanHistory 
        tasks={scanHistory} 
        onRefresh={loadScanHistory} 
      />

      {/* 使用说明 */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          📖 使用说明
        </h3>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p>• 支持的视频格式：MP4, MKV, AVI, MOV, WMV, FLV, M4V</p>
          <p>• 文件名应包含标题和年份，例如：The Matrix (1999).mp4</p>
          <p>• 电视剧文件名格式：Show Name S01E01.mp4 或 Show Name 1x01.mp4</p>
          <p>• 系统会自动从TMDb获取电影和电视剧的详细信息</p>
          <p>• 扫描过程中请不要关闭浏览器窗口</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 text-sm">
            <Link 
              to="/movies" 
              className="text-primary hover:text-primary-dark transition-colors"
            >
              📽️ 查看电影库
            </Link>
            <Link 
              to="/tv-shows" 
              className="text-primary hover:text-primary-dark transition-colors"
            >
              📺 查看电视剧库
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
