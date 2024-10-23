import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Banking.css';
import { Link } from 'react-router-dom';

const App = () => {
    const userId = localStorage.getItem('userId');

    const [messages, setMessages] = useState('');
    const [formData, setFormData] = useState({
        balanceId: userId,
        deposit: { account_id: userId, amount: '' },
        withdraw: { account_id: userId, amount: '' },
        transfer: { sender_id: userId, receiver_id: '', amount: '' },
        historyId: '',
        changePassword: { user_id: '', old_password: '', new_password: '' },
    });
    const [transactionHistory, setTransactionHistory] = useState([]); // New state for transaction history


    const handleSubmitGet = async (e, endpoint, data, resetFields = () => { }) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://127.0.0.1:5000/${endpoint}`, { params: data });

            const formattedBalance = new Intl.NumberFormat('vi-VN', {
                style: 'decimal',
                minimumFractionDigits: 0, // Để không hiển thị số lẻ
                maximumFractionDigits: 0, // Để không hiển thị số lẻ
            }).format(response.data.balance);

            setMessages(<div className="alert alert-success">{formattedBalance}</div>);
            resetFields();
        } catch (error) {
            setMessages(<div className="alert alert-danger">{error.response?.data?.message || 'An error occurred'}</div>);
        }
    };

    const handleSubmit = async (e, endpoint, data, resetFields = () => { }) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, data);
            let successMessage;
            switch (endpoint) {
                case '/deposit':
                    successMessage = "Deposit successful!";
                    break;
                case '/withdraw':
                    successMessage = "Withdraw successful!";
                    break;
                case '/transfer':
                    successMessage = "Transfer successful!";
                    break;
                default:
                    successMessage = response.data.message;
            }
            setMessages(<div className="alert alert-success">{successMessage}</div>);
            resetFields();
        } catch (error) {
            setMessages(<div className="alert alert-danger">{error.response?.data?.message || 'An error occurred'}</div>);
        }
    };

    const formatNumber = (num) => {
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleChange = (e, key, nestedKey) => {
        if (nestedKey) {
            setFormData({ ...formData, [key]: { ...formData[key], [nestedKey]: e.target.value } });
        } else {
            setFormData({ ...formData, [key]: e.target.value });
        }
    };

    // Function to fetch transaction history
    const fetchTransactionHistory = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://127.0.0.1:5000/transactions/${userId}`);
            setTransactionHistory(response.data); // Store transaction history
            setMessages(<div className="alert alert-success">Transaction history fetched successfully!</div>);
        } catch (error) {
            setMessages(<div className="alert alert-danger">{error.response?.data?.message || 'An error occurred'}</div>);
        }
    };

    return (
        <div className="container mt-5">
            <Link to='/logout'>Log Out</Link>
            <h1 className="text-center">Banking Application</h1>
            <div id="messages">{messages}</div>

            {/* Check Balance */}
            <h2>Check Balance</h2>
            <form onSubmit={(e) => handleSubmitGet(e, `balance/${formData.balanceId}`, {})}>
                <button type="submit">Check Balance</button>
            </form>

            {/* Deposit Money */}
            <h2>Deposit Money</h2>
            <form onSubmit={(e) => handleSubmit(e, '/deposit', formData.deposit, () => setFormData({ ...formData, deposit: { amount: '' } }))}>
                <input
                    type="number"
                    value={formData.deposit.amount}
                    onChange={(e) => handleChange(e, 'deposit', 'amount')}
                    placeholder="Amount"
                    required
                />
                <button type="submit">Deposit</button>
            </form>

            {/* Withdraw Money */}
            <h2>Withdraw Money</h2>
            <form onSubmit={(e) => handleSubmit(e, '/withdraw', formData.withdraw, () => setFormData({ ...formData, withdraw: { amount: '' } }))}>
                <input
                    type="number"
                    value={formData.withdraw.amount}
                    onChange={(e) => handleChange(e, 'withdraw', 'amount')}
                    placeholder="Amount"
                    required
                />
                <button type="submit">Withdraw</button>
            </form>

            {/* Transfer Money */}
            <h2>Transfer Money</h2>
            <form onSubmit={(e) => handleSubmit(e, '/transfer', formData.transfer, () => setFormData({ ...formData, transfer: { receiver_id: '', amount: '' } }))}>
                <input
                    type="number"
                    value={formData.transfer.receiver_id}
                    onChange={(e) => handleChange(e, 'transfer', 'receiver_id')}
                    placeholder="Receiver Account ID"
                    required
                />
                <input
                    type="number"
                    value={formData.transfer.amount}
                    onChange={(e) => handleChange(e, 'transfer', 'amount')}
                    placeholder="Amount"
                    required
                />
                <button type="submit">Transfer</button>
            </form>

            {/* Transaction History */}
            <h2>Transaction History</h2>
            <form onSubmit={fetchTransactionHistory}>
                <button type="submit">Get Transaction History</button>
            </form>

            {/* Display Transaction History */}
            {transactionHistory.length > 0 && (
                <div className="mt-4">
                    <h3>Transaction History Details</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Account ID</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Transaction Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactionHistory.map((transaction) => (
                                <tr key={transaction.transaction_id}>
                                    <td>{transaction.transaction_id}</td>
                                    <td>{transaction.account_id}</td>
                                    <td>{new Intl.NumberFormat('vi-VN', {
                                        style: 'decimal',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    }).format(transaction.amount)}</td>
                                    <td>{transaction.date}</td>
                                    <td>{transaction.transaction_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default App;
