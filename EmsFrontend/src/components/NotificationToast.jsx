import { useNotification } from '../context/NotificationContext'
import { X } from 'lucide-react'

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification()

  const getTypeStyles = (type) => {
    const baseStyles = 'px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2'
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`
      case 'error':
        return `${baseStyles} bg-red-500 text-white`
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`
      case 'info':
      default:
        return `${baseStyles} bg-blue-500 text-white`
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {notifications.map(notification => (
        <div key={notification.id} className={getTypeStyles(notification.type)}>
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="hover:opacity-80 transition-opacity"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast
