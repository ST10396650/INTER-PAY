import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { paymentService } from '../services/api'
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
    // totalAmount: 0,  // removed
  })

  useEffect(() => {
    const user = getCurrentUser()
    setFullName(user?.full_name || user?.username || 'Employee')

    const fetchTransactions = async () => {
      try {
        const data = await paymentService.getTransactions()
        setTransactions(data.slice(0, 5))

        setStats({
          totalTransactions: data.length,
          pendingTransactions: data.filter(t => t.status === 'pending').length,
          verifiedTransactions: data.filter(t => t.status === 'verified').length,
          // totalAmount: data.reduce((sum, t) => sum + (t.amount || 0), 0),  // removed
        })
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
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

        {/* Removed Total Amount Section */}
      </div>

      <div style={styles.actionsGrid}>
        <Link to="/employee/profile" style={styles.actionCard}>My Profile</Link>
        <Link to="/employee/transactions" style={styles.actionCard}>View Transactions</Link>
        <Link to="/employee/history" style={styles.actionCard}>Verified History</Link>
      </div>

      <section style={{ marginTop: 40 }}>
        <h2>Recent Transactions</h2>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <ul>
            {transactions.map(t => (
              <li key={t._id || t.id} style={{ marginBottom: 10 }}>
                <strong>{new Date(t.createdAt || t.date).toLocaleString()}</strong> - {t.status} - {t.beneficiary_name} - {t.amount?.toLocaleString() || '0.00'} {t.currency || ''}
              </li>
            ))}
          </ul>
        )}
        <Link to="/employee/transactions">View All Transactions</Link>
      </section>
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
