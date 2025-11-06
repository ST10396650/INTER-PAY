import React, { useEffect, useState } from 'react'
import { paymentService } from '../services/api'
import { getCurrentUser } from '../services/authService'

const ViewTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = getCurrentUser()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Assuming paymentService.getTransactions() fetches all customer transactions
        const data = await paymentService.getTransactions()
        setTransactions(data)
      } catch (err) {
        setError('Failed to fetch transactions.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) return <p>Loading transactions...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <h1>All Transactions</h1>
      <p>Showing all transactions made by customers.</p>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Beneficiary</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Currency</th>
              <th style={thStyle}>Bank Name</th>
              <th style={thStyle}>SWIFT Code</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id || tx.id}>
                <td style={tdStyle}>{new Date(tx.createdAt || tx.date).toLocaleString()}</td>
                <td style={tdStyle}>{tx.status}</td>
                <td style={tdStyle}>{tx.beneficiary_name}</td>
                <td style={tdStyle}>{tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</td>
                <td style={tdStyle}>{tx.currency}</td>
                <td style={tdStyle}>{tx.bank_name || '-'}</td>
                <td style={tdStyle}>{tx.swift_code || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const thStyle = {
  borderBottom: '2px solid #ddd',
  textAlign: 'left',
  padding: '8px',
}

const tdStyle = {
  borderBottom: '1px solid #eee',
  padding: '8px',
}

export default ViewTransactions
