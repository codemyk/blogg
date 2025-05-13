import { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
	const { user } = useContext(UserContext);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isActive, setIsActive] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (
			username.length >= 3 &&
			email &&
			password.length >= 8 &&
			confirmPassword &&
			password === confirmPassword
		) {
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [username, email, password, confirmPassword]);

	const registerUser = (e) => {
		e.preventDefault();

		fetch('http://localhost:4000/users/register', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				email,
				password
			})
		})
		.then(res => res.json())
		.then(data => {
			console.log("Registration Response:", data);

			if (data.message === "User registered successfully") {
				setUsername('');
				setEmail('');
				setPassword('');
				setConfirmPassword('');
				Swal.fire({
					title: "Registration Successful",
					icon: "success",
					text: "Thank you for registering!"
				}).then(() => {
					navigate("/login");
				});
			} else {
				Swal.fire({
					title: "Registration Failed",
					icon: "error",
					text: data.message || "Please try again later or contact support."
				});
			}
		})
		.catch(error => {
			console.error('Error during registration:', error);
			Swal.fire({
				title: "Network Error",
				icon: "error",
				text: "Please check your connection and try again."
			});
		});
	};

	return (
		<Form onSubmit={registerUser} className="p-4 rounded shadow-sm">
			<h1 className="my-4 text-center">Register</h1>

			<Form.Group className="mb-3">
				<Form.Label>Username:</Form.Label>
				<Form.Control
					type="text"
					placeholder="Enter Username"
					required
					minLength={3}
					value={username}
					onChange={e => setUsername(e.target.value)}
				/>
			</Form.Group>

			<Form.Group className="mb-3">
				<Form.Label>Email:</Form.Label>
				<Form.Control
					type="email"
					placeholder="Enter Email"
					required
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
			</Form.Group>

			<Form.Group className="mb-3">
				<Form.Label>Password:</Form.Label>
				<Form.Control
					type="password"
					placeholder="Enter Password (min 8 characters)"
					required
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
			</Form.Group>

			<Form.Group className="mb-4">
				<Form.Label>Confirm Password:</Form.Label>
				<Form.Control
					type="password"
					placeholder="Confirm Password"
					required
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
				/>
			</Form.Group>

			<div className="d-grid">
				<Button 
					variant="primary" 
					type="submit" 
					disabled={!isActive}
				>
					Register
				</Button>
			</div>
		</Form>
	);
}
