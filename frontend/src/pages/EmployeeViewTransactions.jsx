import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeService } from '../services/api'
import { ArrowLeft, Loader } from 'lucide-react'

const EmployeeViewTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'pending', 'verified', 'rejected'
  const [filterDate, setFilterDate] = useState('') // date string yyyy-mm-dd

  useEffect(() => {
    fetchPendingTransactions()
  }, [])

  useEffect(() => {
    applyFilters(filterStatus, filterDate)
  }, [transactions, filterStatus, filterDate])

  const fetchPendingTransactions = async () => {
    setLoading(true)
    try {
      const response = await employeeService.getPendingTransactions()
      setTransactions(response.data.transactions || [])
    } catch (err) {
      console.error('Failed to load pending transactions:', err)
      setError('Failed to load pending transactions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (status, date) => {
    let filtered = transactions

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(t => t.status?.toLowerCase() === status)
    }

    // Filter by date (if date filter is set)
    if (date) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt || t.date)
        // Format transaction date to yyyy-mm-dd
        const transactionDateString = transactionDate.toISOString().split('T')[0]
        return transactionDateString === date
      })
    }

    setFilteredTransactions(filtered)
  }

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
  }

  const handleDateChange = (e) => {
    setFilterDate(e.target.value)
  }

  const handleApprove = async (transactionId) => {
    try {
      setActionLoading(transactionId)
      await employeeService.verifyTransaction(transactionId, '') // pass notes as empty string
      setTransactions((prev) =>
        prev.filter((t) => t._id !== transactionId && t.id !== transactionId)
      )
    } catch (err) {
      console.error('Error approving transaction:', err.response || err)
      alert(
        err.response?.data?.message ||
          'Failed to approve transaction. Please try again.'
      )
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (transactionId) => {
    const rejectionReason = prompt('Please enter the reason for rejection:')
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required.')
      return
    }

    try {
      setActionLoading(transactionId)
      await employeeService.rejectTransaction(transactionId, rejectionReason)
      setTransactions((prev) =>
        prev.filter((t) => t._id !== transactionId && t.id !== transactionId)
      )
    } catch (err) {
      console.error('Error rejecting transaction:', err)
      alert('Failed to reject transaction. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/employee/dashboard" style={styles.backLink}>
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <h1>Customer Transactions</h1>
      </div>

      {/* Filters Container */}
      <div style={styles.filtersWrapper}>
        {/* Status Filter */}
        <div style={styles.filterContainer}>
          <label htmlFor="statusFilter" style={styles.filterLabel}>
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={handleFilterChange}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={styles.filterContainer}>
          <label htmlFor="dateFilter" style={styles.filterLabel}>
            Filter by Date:
          </label>
          <input
            type="date"
            id="dateFilter"
            value={filterDate}
            onChange={handleDateChange}
            style={styles.filterSelect}
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <Loader className="spin" size={30} />{' '}
          <span>Loading pending transactions...</span>
        </div>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : filteredTransactions.length === 0 ? (
        <p>No transactions found for selected filter.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Beneficiary</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Currency</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t, index) => (
              <tr key={t._id || t.id || index}>
                <td style={styles.td}>
                  {new Date(t.createdAt || t.date).toLocaleString()}
                </td>
                <td style={styles.td}>{t.beneficiary_name || 'N/A'}</td>
                <td style={styles.td}>{t.amount?.toLocaleString() || '0.00'}</td>
                <td style={styles.td}>{t.currency || 'ZAR'}</td>
                <td style={{ ...styles.td, ...statusColor(t.status) }}>
                  {t.status || 'Unknown'}
                </td>
                <td style={styles.td}>
                  {actionLoading === (t._id || t.id) ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleApprove(t._id || t.id)}
                        disabled={t.status?.toLowerCase() !== 'pending'}
                      >
                        Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleReject(t._id || t.id)}
                        disabled={t.status?.toLowerCase() !== 'pending'}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: 20,
    maxWidth: 1100,
    margin: 'auto',
  },
  filtersWrapper: {
    display: 'flex',
    gap: 24,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    maxWidth: 300,
  },
  filterLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    minWidth: 120,
    userSelect: 'none',
  },
  filterSelect: {
    flexGrow: 1,
    padding: '8px 12px',
    borderRadius: 6,
    border: '1.5px solid #bbb',
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: 'bold',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
  },
  th: {
    backgroundColor: '#f5f5f5',
    textAlign: 'left',
    padding: '10px 15px',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '10px 15px',
    borderBottom: '1px solid #eee',
  },
  approveBtn: {
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    marginRight: 6,
    borderRadius: 4,
    cursor: 'pointer',
  },
  rejectBtn: {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 4,
    cursor: 'pointer',
  },
}

const statusColor = (status) => {
  if (!status) return { color: 'gray', fontWeight: 'bold' }
  switch (status.toLowerCase()) {
    case 'verified':
      return { color: 'green', fontWeight: 'bold' }
    case 'pending':
      return { color: 'orange', fontWeight: 'bold' }
    case 'rejected':
      return { color: 'red', fontWeight: 'bold' }
    default:
      return { color: 'gray', fontWeight: 'bold' }
  }
}

export default EmployeeViewTransactions
