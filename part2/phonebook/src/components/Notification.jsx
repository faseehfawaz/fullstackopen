const Notification = ({ notification }) => {
  if (!notification || !notification.message) {
    return null
  }

  const className = `notification ${notification.type}`

  return <div className={className}>{notification.message}</div>
}

export default Notification
