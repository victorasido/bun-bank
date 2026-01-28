import { Navigate, Outlet } from 'react-router-dom';

//check local storage
const PrivateRoute = () => {
    const token = localStorage.getItem('token');
    
    //jika tidak ada token, redirect ke login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    //jika ada token, gas
    return <Outlet />;

};

export default PrivateRoute;