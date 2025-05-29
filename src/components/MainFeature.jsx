import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isAfter, isBefore, startOfDay } from 'date-fns'
import Chart from 'react-apexcharts'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [sortBy, setSortBy] = useState('deadline')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  })

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setTasks(prev => [...prev, task])
    setNewTask({ title: '', description: '', priority: 'medium', deadline: '' })
    setIsModalOpen(false)
    toast.success('Task created successfully!')
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updated = { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
        if (updated.completed) {
          toast.success('Task completed! 🎉')
        }
        return updated
      }
      return task
    }))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    toast.success('Task deleted successfully')
  }

  const updateTaskPriority = (id, priority) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, priority, updatedAt: new Date().toISOString() }
        : task
    ))
    toast.success('Priority updated!')
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(task => {
        // Search in title
        const titleMatch = task.title.toLowerCase().includes(query)
        
        // Search in description
        const descriptionMatch = task.description.toLowerCase().includes(query)
        
        // Search in priority
        const priorityMatch = task.priority.toLowerCase().includes(query)
        
        // Search in deadline (formatted)
        let deadlineMatch = false
        if (task.deadline) {
          const formattedDeadline = format(new Date(task.deadline), 'MMM dd, yyyy').toLowerCase()
          deadlineMatch = formattedDeadline.includes(query)
        }
        
        // Search in completion status
        const statusMatch = 
          (task.completed && (query.includes('completed') || query.includes('done'))) ||
          (!task.completed && (query.includes('pending') || query.includes('incomplete') || query.includes('todo')))
        
        return titleMatch || descriptionMatch || priorityMatch || deadlineMatch || statusMatch
      })
    }

    // Filter by status
    if (filter === 'completed') {
      filtered = filtered.filter(task => task.completed)
    } else if (filter === 'pending') {
      filtered = filtered.filter(task => !task.completed)
    } else if (filter === 'overdue') {
      filtered = filtered.filter(task => 
        !task.completed && 
        task.deadline && 
        isBefore(new Date(task.deadline), startOfDay(new Date()))
      )
    }

    // Sort tasks
    return filtered.sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      } else if (sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      return 0
    })
  }


  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.completed).length
    const pending = total - completed
    const overdue = tasks.filter(task => 
      !task.completed && 
      task.deadline && 
      isBefore(new Date(task.deadline), startOfDay(new Date()))
    ).length

    return { total, completed, pending, overdue }
  }

  const getPriorityStats = () => {
    const stats = { high: 0, medium: 0, low: 0 }
    tasks.forEach(task => {
      if (!task.completed) {
        stats[task.priority]++
      }
    })
    return stats
  }

  const stats = getTaskStats()
  const priorityStats = getPriorityStats()

  // Chart options for progress chart
  const progressChartOptions = {
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    labels: ['Completed', 'Pending', 'Overdue'],
    legend: { position: 'bottom' },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 280 },
        legend: { position: 'bottom' }
      }
    }]
  }

  const progressChartSeries = [stats.completed, stats.pending - stats.overdue, stats.overdue]

  // Chart options for priority chart
  const priorityChartOptions = {
    chart: { type: 'bar', fontFamily: 'Inter, sans-serif' },
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    xaxis: { categories: ['High', 'Medium', 'Low'] },
    title: { text: 'Tasks by Priority', style: { fontSize: '16px' } }
  }

  const priorityChartSeries = [{
    name: 'Pending Tasks',
    data: [priorityStats.high, priorityStats.medium, priorityStats.low]
  }]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      default: return 'text-surface-600 bg-surface-100 dark:bg-surface-800 dark:text-surface-400'
    }
  }

  const getDeadlineStatus = (deadline, completed) => {
    if (completed) return 'completed'
    if (!deadline) return 'no-deadline'
    
    const today = startOfDay(new Date())
    const taskDeadline = startOfDay(new Date(deadline))
    
    if (isBefore(taskDeadline, today)) return 'overdue'
    if (taskDeadline.getTime() === today.getTime()) return 'due-today'
    return 'upcoming'
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-2">
            Task Dashboard
          </h2>
          <p className="text-surface-600 dark:text-surface-400 text-lg">
            Manage your tasks efficiently with priority tracking
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-black font-semibold rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>Create Task</span>
        </motion.button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {[
          { label: 'Total Tasks', value: stats.total, icon: 'ListTodo', color: 'primary' },
          { label: 'Completed', value: stats.completed, icon: 'CheckCircle', color: 'green' },
          { label: 'Pending', value: stats.pending, icon: 'Clock', color: 'amber' },
          { label: 'Overdue', value: stats.overdue, icon: 'AlertTriangle', color: 'red' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5, scale: 1.02 }}
            className="task-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                <ApperIcon 
                  name={stat.icon} 
                  className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} 
                />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-surface-100"
              >
                {stat.value}
              </motion.div>
            </div>
            <p className="text-sm md:text-base text-surface-600 dark:text-surface-400 font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="task-card p-6">
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Task Progress
          </h3>
          <Chart
            options={progressChartOptions}
            series={progressChartSeries}
            type="donut"
            height={320}
          />
        </div>
        <div className="task-card p-6">
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-4">
            Priority Distribution
          </h3>
          <Chart
            options={priorityChartOptions}
            series={priorityChartSeries}
            type="bar"
            height={320}
          />
        </div>
      </motion.div>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="task-card p-4 md:p-6"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ApperIcon name="Search" className="w-5 h-5 text-surface-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, deadline, priority, or status..."
              className="w-full pl-10 pr-10 py-3 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 placeholder-surface-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 text-sm text-surface-600 dark:text-surface-400"
          >
            {getFilteredTasks().length} task{getFilteredTasks().length !== 1 ? 's' : ''} found for "{searchQuery}"
          </motion.div>
        )}
      </motion.div>



      {/* Filters and Sort */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'completed', 'overdue'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                filter === filterOption
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="priority">Sort by Priority</option>
          <option value="created">Sort by Created</option>
        </select>
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4"
      >
        <AnimatePresence>
          {getFilteredTasks().map((task, index) => {
            const deadlineStatus = getDeadlineStatus(task.deadline, task.completed)
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`task-card p-4 md:p-6 relative overflow-hidden ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                {/* Priority Indicator */}
                <div className={`priority-indicator priority-${task.priority}`} />

                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-surface-300 dark:border-surface-600 hover:border-green-500'
                    }`}
                  >
                    {task.completed && <ApperIcon name="Check" className="w-4 h-4" />}
                  </motion.button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4 className={`text-lg font-semibold ${
                        task.completed 
                          ? 'line-through text-surface-500 dark:text-surface-500' 
                          : 'text-surface-900 dark:text-surface-100'
                      }`}>
                        {task.title}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <select
                            value={task.priority}
                            onChange={(e) => updateTaskPriority(task.id, e.target.value)}
                            className="text-xs p-1 rounded bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {task.description && (
                      <p className={`text-surface-600 dark:text-surface-400 mb-3 ${
                        task.completed ? 'line-through' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}

                    {/* Deadline and Status */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {task.deadline && (
                        <div className={`flex items-center gap-1 ${
                          deadlineStatus === 'overdue' ? 'text-red-600 dark:text-red-400' :
                          deadlineStatus === 'due-today' ? 'text-amber-600 dark:text-amber-400' :
                          deadlineStatus === 'completed' ? 'text-green-600 dark:text-green-400' :
                          'text-surface-600 dark:text-surface-400'
                        }`}>
                          <ApperIcon name="Calendar" className="w-4 h-4" />
                          <span>{format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                          {deadlineStatus === 'overdue' && !task.completed && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-surface-500 dark:text-surface-500">
                        <ApperIcon name="Clock" className="w-4 h-4" />
                        <span>Created {format(new Date(task.createdAt), 'MMM dd')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {getFilteredTasks().length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center">
              <ApperIcon name="ListTodo" className="w-12 h-12 text-surface-400" />
            </div>
            <h3 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">
              No tasks found
            </h3>
            <p className="text-surface-500 dark:text-surface-500">
              {filter === 'all' ? 'Create your first task to get started!' : `No ${filter} tasks available.`}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md task-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  Create New Task
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Task description (optional)..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                      className="w-full p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-black font-medium rounded-xl hover:shadow-card transition-all duration-300"
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature