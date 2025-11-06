import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeService } from '../services/api'  // Use employeeService here
import { getCurrentUser } from '../services/authService'
import { User, History, TrendingUp } from 'lucide-react'

const EmployeeDashboard = () => {
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    verifiedTransactions: 0,
  })

  useEffect(() => {
    const user = getCurrentUser()
    setFullName(user?.full_name || user?.username || 'Employee')

    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats (pending, verified counts etc)
        const dashboardResponse = await employeeService.getDashboardStats()
        const dashboardData = dashboardResponse.data

        // Update stats from backend counts
        setStats({
          pendingTransactions: dashboardData.stats.pendingTransactions || 0,
          verifiedTransactions: dashboardData.stats.verifiedTransactions || 0,
          totalTransactions: dashboardData.stats.pendingTransactions + dashboardData.stats.verifiedTransactions, // or calculate differently if you have total count on backend
        })

        // Optionally, fetch recent pending transactions from dashboard data
        setTransactions(dashboardData.recentPending || [])

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div style={styles.container}>
      <h1>
        Welcome back, <span style={{ color: 'var(--accent-color)' }}>{fullName}</span>!
      </h1>
      <p>Manage your employee dashboard</p>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <TrendingUp size={24} />
          <div>{stats.totalTransactions}</div>
          <div>Total Transactions</div>
        </div>

        <div style={styles.statCard}>
          <History size={24} />
          <div>{stats.pendingTransactions}</div>
          <div>Pending</div>
        </div>

        <div style={styles.statCard}>
          <History size={24} />
          <div>{stats.verifiedTransactions}</div>
          <div>Verified</div>
        </div>
      </div>

      <div style={styles.actionsGrid}>
        <Link to="/employee/profile" style={styles.actionCard}>My Profile</Link>
        <Link to="/employee/transactions" style={styles.actionCard}>View Transactions</Link>
        <Link to="/employee/history" style={styles.actionCard}>Verified History</Link>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: 20, maxWidth: 900, margin: 'auto' },
  statsGrid: { display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 20 },
  statCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    fontWeight: '600',
  },
  actionsGrid: { display: 'flex', gap: 20, marginTop: 30 },
  actionCard: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ddd',
    textAlign: 'center',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: '600',
    color: '#000',
  },
}

export default EmployeeDashboard
