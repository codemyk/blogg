import { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';

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

		fetch('https://blogg-1qrd.onrender.com/users/register', {
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
		<Container className="d-flex justify-content-center align-items-center login-bg" style={{ minHeight: '100vh' }}>
			<Card className="p-5 shadow-lg w-100" style={{ maxWidth: '500px' }}>
				
				{/* 🌟 Logo Image */}
				<img src="/logo.png" alt="Blogg Logo" style={{ width: "150px", margin: "0 auto", display: "block" }} />

				<h2 className="text-center mt-3 mb-4">Register</h2>

				<Form onSubmit={registerUser}>
					<Form.Group className="mb-3">
						<Form.Label>Username</Form.Label>
						<Form.Control
							type="text"
							placeholder="Enter username"
							required
							minLength={3}
							value={username}
							onChange={e => setUsername(e.target.value)}
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Email</Form.Label>
						<Form.Control
							type="email"
							placeholder="Enter email"
							required
							value={email}
							onChange={e => setEmail(e.target.value)}
						/>
					</Form.Group>

					<Form.Group className="mb-3">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							placeholder="Enter password (min 8 chars.)"
							required
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
					</Form.Group>

					<Form.Group className="mb-4">
						<Form.Label>Confirm Password</Form.Label>
						<Form.Control
							type="password"
							placeholder="Confirm password"
							required
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
						/>
					</Form.Group>

					<Button 
					  variant={isActive ? "primary" : "danger"} 
					  type="submit" 
					  disabled={!isActive}
					>
					  Register
					</Button>
				</Form>
			</Card>
		</Container>
	);
}
