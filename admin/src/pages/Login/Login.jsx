import { Lock } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Login({ url }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

 const handleLogin = async (e) => {
  e.preventDefault()
  try {
    const res = await axios.post(`${url}/api/user/login`, { email, password })
    if (res.data.success) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user)) // ✅ Simpan user ke localStorage
      navigate('/')
    } else {
      alert(res.data.message)
    }
  } catch (error) {
    console.error(error)
    alert('Login failed')
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
          <p className="text-gray-600">Manajemen Inventaris Labodine</p>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Masuk
        </button>
        <p className="text-sm text-center mt-4">
          Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline">Daftar</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
