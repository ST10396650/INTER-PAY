import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { paymentService } from '../services/api'
import { Plus, History, User, TrendingUp } from 'lucide-react'

const CustomerDashboard = () => {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalTransactions: 0,
        pendingTransactions: 0,
        totalAmount: 0
    })

    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = async () => {
        try {
            const response = await paymentService.getTransactions()
            setTransactions(response.data.slice(0, 5)) // Show last 5 transactions

            // Calculate stats
            const total = response.data.length
            const pending = response.data.filter(t => t.status === 'pending').length
            const totalAmount = response.data.reduce((sum, t) => sum + t.amount, 0)

            setStats({
                totalTransactions: total,
                pendingTransactions: pending,
                totalAmount: totalAmount
            })
        } catch (error) {
            console.error('Failed to load transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--success-color)'
            case 'pending': return 'var(--warning-color)'
            case 'failed': return 'var(--error-color)'
            default: return 'var(--text-secondary)'
        }
    }

    return (
        <>
            <Helmet>
                <title>Dashboard - International Payments Portal</title>
            </Helmet>

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Welcome back!</h1>
                    <p style={styles.subtitle}>Manage your international payments</p>
                </div>

                {/* Quick Stats */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <TrendingUp size={24} />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statNumber}>{stats.totalTransactions}</div>
                            <div style={styles.statLabel}>Total Transactions</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={{...styles.actionIcon, backgroundColor: 'rgba(221, 107, 32, 0.1)' }}>
                            <History size={24} color="var(--warning-color)" />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statNumber}>{stats.pendingTransactions}</div>
                            <div style={styles.statLabel}>Pending</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={{ ...styles.statIcon, backgroundColor: 'rgba(56, 161, 105, 0.1)' }}>
                            <User size={24} color="var(--success-color)" />
                        </div>
                        <div style={styles.statContent}>
                            <div style={styles.statNumber}>
                                ${stats.totalAmount.toLocaleString()}
                            </div>
                            <div style={styles.statLabel}>Total Sent</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={styles.actionsGrid}>
                    <Link to="/make-payment" style={styles.actionCard}>
                        <div style={styles.actionIcon}>
                            <Plus size={32} />
                        </div>
                        <h3 style={styles.actionTitle}>Make Payment</h3>
                        <p style={styles.actionDescription}>
                            Create a new international payment
                        </p>
                    </Link>

                    <Link to="/transaction-history" style={styles.actionCard}>
                        <div style={styles.actionIcon}>
                            <History size={32} />
                        </div>
                        <h3 style={styles.actionTitle}>Transaction History</h3>
                        <p style={styles.actionDescription}>
                            View all your past transactions
                        </p>
                    </Link>
                </div>

                {/* Recent Transactions */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Recent Transactions</h2>
                        <Link to="/transaction-history" style={styles.viewAllLink}>
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No transactions yet</p>
                            <Link to="/make-payment" style={styles.ctaLink}>
                                Make your first payment
                            </Link>
                        </div>
                    ) : (
                        <div style={styles.transactionsList}>
                            {transactions.map(transaction => (
                                <div key={transaction._id || transaction.id || transaction.transaction_id}  style={styles.transactionItem}>
                                    <div style={styles.transactionMain}>
                                        <div style={styles.transactionInfo}>
                                            <div style={styles.transactionAmount}>
                                                {transaction.currency} {transaction.amount.toLocaleString()}
                                            </div>
                                            <div style={styles.transactionBeneficiary}>
                                                To: {transaction.beneficiary_name}
                                            </div>
                                        </div>
                                        <div style={styles.transactionMeta}>
                                            <div style={styles.transactionDate}>
                                                {transaction.created_at 
                                                      ? new Date(transaction.created_at).toLocaleDateString('en-US', {
                                                         year: 'numeric',
                                                         month: 'short',
                                                         day: 'numeric'
                                                       })
                                                     : 'N/A'
                                                }
                                            </div>
                                            <div
                                                style={{
                                                    ...styles.transactionStatus,
                                                    color: getStatusColor(transaction.status)
                                                }}
                                            >
                                                {transaction.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
    },
    header: {
        marginBottom: '40px',
        textAlign: 'center'
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        marginBottom: '8px'
    },
    subtitle: {
        fontSize: '18px',
        color: 'var(--text-secondary)'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
    },
    statCard: {
        background: 'var(--surface-color)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    statIcon: {
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-color)'
    },
    statContent: {
        flex: 1
    },
    statNumber: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        marginBottom: '4px'
    },
    statLabel: {
        color: 'var(--text-secondary)',
        fontSize: '14px'
    },
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
    },
    actionCard: {
        background: 'var(--surface-color)',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.3s, box-shadow 0.3s',
        textAlign: 'center'
    },
    actionCardHover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    },
    actionIcon: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        color: 'var(--accent-color)'
    },
    actionTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: 'var(--text-primary)'
    },
    actionDescription: {
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
    },
    section: {
        background: 'var(--surface-color)',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--text-primary)'
    },
    viewAllLink: {
        color: 'var(--accent-color)',
        textDecoration: 'none',
        fontWeight: '600'
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: 'var(--text-secondary)'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: 'var(--text-secondary)'
    },
    ctaLink: {
        color: 'var(--accent-color)',
        textDecoration: 'none',
        fontWeight: '600',
        marginTop: '8px',
        display: 'inline-block'
    },
    transactionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    transactionItem: {
        padding: '16px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        transition: 'background-color 0.3s'
    },
    transactionMain: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    transactionInfo: {
        flex: 1
    },
    transactionAmount: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        marginBottom: '4px'
    },
    transactionBeneficiary: {
        color: 'var(--text-secondary)',
        fontSize: '14px'
    },
    transactionMeta: {
        textAlign: 'right'
    },
    transactionDate: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        marginBottom: '4px'
    },
    transactionStatus: {
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
    }
}

export default CustomerDashboard