import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [urgency, setUrgency] = useState('low');
    const [userActivity, setUserActivity] = useState('inactive');
    const [status, setStatus] = useState('');

    const sendEmail = async () => {
        try {
            const response = await axios.post('/send-email', { to, subject, message, urgency, userActivity });
            setStatus(response.data);
            setTimeout(() => {
                setTo('');
                setSubject('');
                setMessage('');
                setUrgency('low');
                setUserActivity('inactive');
                setStatus('');
            }, 2000);
        } catch (error) {
            console.log(error);
            setStatus('Failed to send email');
        }
    };

    return (
        <div className="App">
            <h1>Send Email</h1>
            <input type="email" placeholder="Recipient" value={to} onChange={(e) => setTo(e.target.value)} />
            <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
            <select value={userActivity} onChange={(e) => setUserActivity(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            <button onClick={sendEmail}>Send Email</button>
            <p>{status}</p>
        </div>
    );
}

export default App;
