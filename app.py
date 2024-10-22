from flask import Flask, request, jsonify, render_template
from config import get_db_connection

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('index.html')

@app.route('/balance/<int:account_id>', methods=['GET'])
def get_balance(account_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT balance FROM accounts WHERE account_id = %s", (account_id,))
    account = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if account:
        return jsonify(account)
    return jsonify({"error": "Account not found"}), 404

# API for deposit (nạp tiền)
@app.route('/deposit', methods=['POST'])
def deposit():
    data = request.json
    account_id = data['account_id']
    amount = data['amount']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE accounts SET balance = balance + %s WHERE account_id = %s", (amount, account_id))
    cursor.execute("INSERT INTO transactions (account_id, transaction_type, amount) VALUES(%s, %s, %s)", (account_id, 'deposit', amount))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Deposit successful"}), 200

# API for withdrawal (rút tiền)
@app.route('/withdraw', methods=['POST'])
def withdraw():
    data = request.json
    account_id = data['account_id']
    amount = data['amount']
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT balance FROM accounts WHERE account_id = %s", (account_id,))
    account = cursor.fetchone()
    
    if account and account['balance'] >= amount:
        new_balance = account['balance'] - amount
        cursor.execute("UPDATE accounts SET balance = %s WHERE account_id = %s", (new_balance, account_id))
        cursor.execute("INSERT INTO transactions (account_id, transaction_type, amount) VALUES(%s, %s, %s)",
                       (account_id, 'withdraw', amount))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Withdrawal successful", "new_balance": new_balance})
    else:
        cursor.close()
        conn.close()
        return jsonify({"message": "Insufficient funds"}), 400

if __name__ == "__main__":
    app.run(debug=True)