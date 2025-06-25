#!/usr/bin/env python3
"""
SceneScape Backend - 后台任务管理器
处理长时间运行的后台任务，如媒体扫描、图片下载等
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, Any, Optional, Callable, List
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    """任务状态枚举"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class TaskProgress:
    """任务进度信息"""
    current: int = 0
    total: int = 0
    message: str = ""
    
    @property
    def percentage(self) -> float:
        """计算百分比"""
        if self.total == 0:
            return 0.0
        return (self.current / self.total) * 100

@dataclass
class BackgroundTask:
    """后台任务信息"""
    id: str
    name: str
    status: TaskStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: TaskProgress = field(default_factory=TaskProgress)
    result: Any = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def duration(self) -> Optional[timedelta]:
        """计算任务运行时间"""
        if not self.started_at:
            return None
        
        end_time = self.completed_at or datetime.now()
        return end_time - self.started_at

class TaskManager:
    """后台任务管理器"""
    
    def __init__(self, max_concurrent_tasks: int = 5):
        self.max_concurrent_tasks = max_concurrent_tasks
        self.tasks: Dict[str, BackgroundTask] = {}
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.workers_running = False
        self._cleanup_interval = 3600  # 1小时清理一次
        self._max_task_history = 100  # 最多保留100个历史任务
    
    async def start_workers(self):
        """启动工作进程"""
        if self.workers_running:
            return
        
        self.workers_running = True
        
        # 启动工作进程
        workers = []
        for i in range(self.max_concurrent_tasks):
            worker = asyncio.create_task(self._worker(f"worker-{i}"))
            workers.append(worker)
        
        # 启动清理任务
        cleanup_task = asyncio.create_task(self._cleanup_worker())
        workers.append(cleanup_task)
        
        logger.info(f"启动了 {self.max_concurrent_tasks} 个工作进程")
        
        # 等待所有工作进程（这在正常情况下不会返回）
        await asyncio.gather(*workers)
    
    async def stop_workers(self):
        """停止工作进程"""
        self.workers_running = False
        
        # 取消所有运行中的任务
        for task_id, task in self.running_tasks.items():
            if not task.done():
                task.cancel()
                self.tasks[task_id].status = TaskStatus.CANCELLED
        
        self.running_tasks.clear()
        logger.info("已停止所有工作进程")
    
    async def _worker(self, worker_name: str):
        """工作进程"""
        logger.info(f"工作进程 {worker_name} 已启动")
        
        while self.workers_running:
            try:
                # 从队列获取任务
                task_info = await asyncio.wait_for(
                    self.task_queue.get(),
                    timeout=1.0
                )
                
                task_id, coro_func, args, kwargs = task_info
                task = self.tasks.get(task_id)
                
                if not task or task.status != TaskStatus.PENDING:
                    continue
                
                # 更新任务状态
                task.status = TaskStatus.RUNNING
                task.started_at = datetime.now()
                
                logger.info(f"工作进程 {worker_name} 开始执行任务 {task_id}: {task.name}")
                
                try:
                    # 创建任务协程
                    if asyncio.iscoroutinefunction(coro_func):
                        coro = coro_func(task, *args, **kwargs)
                    else:
                        # 如果是普通函数，在执行器中运行
                        loop = asyncio.get_event_loop()
                        coro = loop.run_in_executor(None, coro_func, task, *args, **kwargs)
                    
                    # 执行任务
                    async_task = asyncio.create_task(coro)
                    self.running_tasks[task_id] = async_task
                    
                    result = await async_task
                    
                    # 任务成功完成
                    task.status = TaskStatus.COMPLETED
                    task.completed_at = datetime.now()
                    task.result = result
                    
                    logger.info(f"任务 {task_id} 执行成功，耗时 {task.duration}")
                    
                except asyncio.CancelledError:
                    task.status = TaskStatus.CANCELLED
                    task.completed_at = datetime.now()
                    logger.info(f"任务 {task_id} 被取消")
                    
                except Exception as e:
                    task.status = TaskStatus.FAILED
                    task.completed_at = datetime.now()
                    task.error = str(e)
                    logger.error(f"任务 {task_id} 执行失败: {e}")
                
                finally:
                    # 清理运行中的任务记录
                    self.running_tasks.pop(task_id, None)
                    
                    # 标记队列任务完成
                    self.task_queue.task_done()
                
            except asyncio.TimeoutError:
                # 队列为空，继续等待
                continue
            except Exception as e:
                logger.error(f"工作进程 {worker_name} 出错: {e}")
                await asyncio.sleep(1)
        
        logger.info(f"工作进程 {worker_name} 已停止")
    
    async def _cleanup_worker(self):
        """清理工作进程"""
        while self.workers_running:
            try:
                await asyncio.sleep(self._cleanup_interval)
                await self._cleanup_old_tasks()
            except Exception as e:
                logger.error(f"清理任务出错: {e}")
    
    async def _cleanup_old_tasks(self):
        """清理旧任务"""
        # 保留最近的任务和运行中的任务
        completed_tasks = [
            (task_id, task) for task_id, task in self.tasks.items()
            if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]
        ]
        
        if len(completed_tasks) > self._max_task_history:
            # 按完成时间排序，删除最旧的任务
            completed_tasks.sort(key=lambda x: x[1].completed_at or datetime.min)
            
            tasks_to_remove = completed_tasks[:-self._max_task_history]
            for task_id, _ in tasks_to_remove:
                del self.tasks[task_id]
                logger.debug(f"清理旧任务: {task_id}")
    
    def create_task(
        self,
        name: str,
        coro_func: Callable,
        *args,
        task_id: str = None,
        metadata: Dict[str, Any] = None,
        **kwargs
    ) -> str:
        """
        创建后台任务
        
        Args:
            name: 任务名称
            coro_func: 任务函数（协程或普通函数）
            *args: 位置参数
            task_id: 可选的任务ID
            metadata: 任务元数据
            **kwargs: 关键字参数
            
        Returns:
            任务ID
        """
        if task_id is None:
            task_id = str(uuid.uuid4())
        
        # 创建任务对象
        task = BackgroundTask(
            id=task_id,
            name=name,
            status=TaskStatus.PENDING,
            created_at=datetime.now(),
            metadata=metadata or {}
        )
        
        self.tasks[task_id] = task
        
        # 添加到队列
        asyncio.create_task(
            self.task_queue.put((task_id, coro_func, args, kwargs))
        )
        
        logger.info(f"创建任务 {task_id}: {name}")
        return task_id
    
    def get_task(self, task_id: str) -> Optional[BackgroundTask]:
        """获取任务信息"""
        return self.tasks.get(task_id)
    
    def get_tasks(
        self,
        status: TaskStatus = None,
        limit: int = None,
        offset: int = 0
    ) -> List[BackgroundTask]:
        """
        获取任务列表
        
        Args:
            status: 过滤状态
            limit: 限制数量
            offset: 偏移量
            
        Returns:
            任务列表
        """
        tasks = list(self.tasks.values())
        
        # 按创建时间倒序排序
        tasks.sort(key=lambda x: x.created_at, reverse=True)
        
        # 状态过滤
        if status:
            tasks = [task for task in tasks if task.status == status]
        
        # 分页
        if offset > 0:
            tasks = tasks[offset:]
        
        if limit:
            tasks = tasks[:limit]
        
        return tasks
    
    def cancel_task(self, task_id: str) -> bool:
        """
        取消任务
        
        Args:
            task_id: 任务ID
            
        Returns:
            是否成功取消
        """
        task = self.tasks.get(task_id)
        if not task:
            return False
        
        if task.status == TaskStatus.RUNNING:
            # 取消运行中的任务
            async_task = self.running_tasks.get(task_id)
            if async_task and not async_task.done():
                async_task.cancel()
                return True
        elif task.status == TaskStatus.PENDING:
            # 标记待处理任务为已取消
            task.status = TaskStatus.CANCELLED
            task.completed_at = datetime.now()
            return True
        
        return False
    
    def update_task_progress(
        self,
        task_id: str,
        current: int = None,
        total: int = None,
        message: str = None
    ) -> bool:
        """
        更新任务进度
        
        Args:
            task_id: 任务ID
            current: 当前进度
            total: 总进度
            message: 进度消息
            
        Returns:
            是否更新成功
        """
        task = self.tasks.get(task_id)
        if not task:
            return False
        
        if current is not None:
            task.progress.current = current
        if total is not None:
            task.progress.total = total
        if message is not None:
            task.progress.message = message
        
        return True
    
    def get_stats(self) -> Dict[str, Any]:
        """获取任务管理器统计信息"""
        stats = {
            "total_tasks": len(self.tasks),
            "running_tasks": len(self.running_tasks),
            "queue_size": self.task_queue.qsize(),
            "max_concurrent": self.max_concurrent_tasks,
            "workers_running": self.workers_running,
            "status_counts": {}
        }
        
        # 统计各状态任务数量
        for status in TaskStatus:
            count = sum(1 for task in self.tasks.values() if task.status == status)
            stats["status_counts"][status.value] = count
        
        return stats

# 全局任务管理器实例
task_manager = TaskManager()

# 便捷函数
def create_background_task(
    name: str,
    coro_func: Callable,
    *args,
    task_id: str = None,
    metadata: Dict[str, Any] = None,
    **kwargs
) -> str:
    """创建后台任务的便捷函数"""
    return task_manager.create_task(
        name, coro_func, *args,
        task_id=task_id, metadata=metadata, **kwargs
    )

def get_task_info(task_id: str) -> Optional[BackgroundTask]:
    """获取任务信息的便捷函数"""
    return task_manager.get_task(task_id)

def update_progress(task_id: str, current: int = None, total: int = None, message: str = None) -> bool:
    """更新任务进度的便捷函数"""
    return task_manager.update_task_progress(task_id, current, total, message)
